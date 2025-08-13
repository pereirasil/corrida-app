const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// =====================================================
// INICIAR NOVA SESSÃO DE CORRIDA
// =====================================================
router.post('/sessions', auth, [
  body('title').optional().trim().isLength({ max: 255 }).withMessage('Título deve ter no máximo 255 caracteres'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('is_public').optional().isBoolean().withMessage('is_public deve ser um booleano'),
  body('is_group_run').optional().isBoolean().withMessage('is_group_run deve ser um booleano')
], async (req, res) => {
  try {
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const userId = req.user.userId;
    const { title, description, is_public = true, is_group_run = false } = req.body;

    // Criar nova sessão
    const newSession = await pool.query(
      `INSERT INTO running_sessions (user_id, title, description, start_time, is_public, is_group_run)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5)
       RETURNING id, title, description, start_time, is_public, is_group_run, created_at`,
      [userId, title, description, is_public, is_group_run]
    );

    // Se for corrida em grupo, adicionar usuário como participante
    if (is_group_run) {
      await pool.query(
        `INSERT INTO group_run_participants (session_id, user_id, status)
         VALUES ($1, $2, 'active')`,
        [newSession.rows[0].id, userId]
      );
    }

    res.status(201).json({
      message: 'Sessão de corrida iniciada com sucesso',
      session: newSession.rows[0]
    });

  } catch (error) {
    console.error('Erro ao iniciar sessão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// ATUALIZAR SESSÃO DE CORRIDA (finalizar)
// =====================================================
router.put('/sessions/:sessionId', auth, [
  body('end_time').optional().isISO8601().withMessage('end_time deve ser uma data válida'),
  body('distance').optional().isFloat({ min: 0 }).withMessage('Distância deve ser um número positivo'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duração deve ser um número inteiro positivo'),
  body('average_pace').optional().isFloat({ min: 0 }).withMessage('Pace médio deve ser um número positivo'),
  body('average_speed').optional().isFloat({ min: 0 }).withMessage('Velocidade média deve ser um número positivo'),
  body('max_speed').optional().isFloat({ min: 0 }).withMessage('Velocidade máxima deve ser um número positivo'),
  body('calories').optional().isInt({ min: 0 }).withMessage('Calorias devem ser um número inteiro positivo'),
  body('steps').optional().isInt({ min: 0 }).withMessage('Passos devem ser um número inteiro positivo'),
  body('heart_rate_avg').optional().isInt({ min: 0, max: 300 }).withMessage('Frequência cardíaca deve estar entre 0 e 300'),
  body('heart_rate_max').optional().isInt({ min: 0, max: 300 }).withMessage('Frequência cardíaca máxima deve estar entre 0 e 300'),
  body('elevation_gain').optional().isFloat().withMessage('Ganho de elevação deve ser um número'),
  body('elevation_loss').optional().isFloat().withMessage('Perda de elevação deve ser um número'),
  body('weather_conditions').optional().isObject().withMessage('Condições climáticas devem ser um objeto')
], async (req, res) => {
  try {
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const userId = req.user.userId;
    const { sessionId } = req.params;
    const updateData = req.body;

    // Verificar se a sessão pertence ao usuário
    const sessionCheck = await pool.query(
      'SELECT id, user_id, end_time FROM running_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada'
      });
    }

    if (sessionCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar'
      });
    }

    // Adicionar updated_at e sessionId
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(sessionId);

    const updateQuery = `
      UPDATE running_sessions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const updatedSession = await pool.query(updateQuery, updateValues);

    res.json({
      message: 'Sessão atualizada com sucesso',
      session: updatedSession.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// ADICIONAR PONTO DA ROTA
// =====================================================
router.post('/sessions/:sessionId/points', auth, [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude deve estar entre -90 e 90'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude deve estar entre -180 e 180'),
  body('altitude').optional().isFloat().withMessage('Altitude deve ser um número'),
  body('accuracy').optional().isFloat({ min: 0 }).withMessage('Precisão deve ser um número positivo'),
  body('speed').optional().isFloat({ min: 0 }).withMessage('Velocidade deve ser um número positivo'),
  body('timestamp').isISO8601().withMessage('Timestamp deve ser uma data válida')
], async (req, res) => {
  try {
    // Validar dados de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const userId = req.user.userId;
    const { sessionId } = req.params;
    const { latitude, longitude, altitude, accuracy, speed, timestamp } = req.body;

    // Verificar se a sessão pertence ao usuário
    const sessionCheck = await pool.query(
      'SELECT id, user_id, end_time FROM running_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada'
      });
    }

    if (sessionCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    if (sessionCheck.rows[0].end_time) {
      return res.status(400).json({
        error: 'Sessão já finalizada'
      });
    }

    // Adicionar ponto da rota
    const newPoint = await pool.query(
      `INSERT INTO route_points (session_id, latitude, longitude, altitude, accuracy, speed, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, latitude, longitude, altitude, accuracy, speed, timestamp, created_at`,
      [sessionId, latitude, longitude, altitude, accuracy, speed, timestamp]
    );

    res.status(201).json({
      message: 'Ponto da rota adicionado com sucesso',
      point: newPoint.rows[0]
    });

  } catch (error) {
    console.error('Erro ao adicionar ponto da rota:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER PONTOS DA ROTA
// =====================================================
router.get('/sessions/:sessionId/points', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Verificar se a sessão pertence ao usuário
    const sessionCheck = await pool.query(
      'SELECT id, user_id, is_public FROM running_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada'
      });
    }

    const session = sessionCheck.rows[0];
    
    // Verificar permissão (usuário próprio ou sessão pública)
    if (session.user_id !== userId && !session.is_public) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Buscar pontos da rota
    const points = await pool.query(
      `SELECT id, latitude, longitude, altitude, accuracy, speed, timestamp
       FROM route_points 
       WHERE session_id = $1
       ORDER BY timestamp ASC`,
      [sessionId]
    );

    res.json({
      points: points.rows
    });

  } catch (error) {
    console.error('Erro ao obter pontos da rota:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER SESSÕES DO USUÁRIO
// =====================================================
router.get('/sessions', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    const offset = (page - 1) * limit;

    // Construir query base
    let whereClause = 'WHERE user_id = $1';
    let queryParams = [userId];
    let paramCount = 1;

    // Filtrar por status
    if (status === 'active') {
      whereClause += ' AND end_time IS NULL';
    } else if (status === 'completed') {
      whereClause += ' AND end_time IS NOT NULL';
    }

    // Contar total de sessões
    const countQuery = `SELECT COUNT(*) FROM running_sessions ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);

    const totalSessions = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalSessions / limit);

    // Buscar sessões
    const sessionsQuery = `
      SELECT id, title, description, start_time, end_time, distance, duration,
             average_pace, average_speed, max_speed, calories, steps, 
             heart_rate_avg, heart_rate_max, elevation_gain, elevation_loss,
             weather_conditions, is_public, is_group_run, created_at
      FROM running_sessions 
      ${whereClause}
      ORDER BY start_time DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const sessions = await pool.query(sessionsQuery, queryParams);

    res.json({
      sessions: sessions.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalSessions,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao obter sessões:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER SESSÃO ESPECÍFICA
// =====================================================
router.get('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Verificar se a sessão pertence ao usuário ou é pública
    const session = await pool.query(
      `SELECT rs.*, 
              u.name as user_name, u.username as user_username, u.avatar_url as user_avatar
       FROM running_sessions rs
       JOIN users u ON rs.user_id = u.id
       WHERE rs.id = $1 AND (rs.user_id = $2 OR rs.is_public = true)`,
      [sessionId, userId]
    );

    if (session.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada'
      });
    }

    // Se for corrida em grupo, buscar participantes
    let participants = [];
    if (session.rows[0].is_group_run) {
      const participantsResult = await pool.query(
        `SELECT grp.*, u.name, u.username, u.avatar_url
         FROM group_run_participants grp
         JOIN users u ON grp.user_id = u.id
         WHERE grp.session_id = $1
         ORDER BY grp.joined_at ASC`,
        [sessionId]
      );
      participants = participantsResult.rows;
    }

    res.json({
      session: {
        ...session.rows[0],
        participants
      }
    });

  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// PARTICIPAR DE CORRIDA EM GRUPO
// =====================================================
router.post('/sessions/:sessionId/join', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Verificar se a sessão existe e é de grupo
    const sessionCheck = await pool.query(
      'SELECT id, user_id, is_group_run, end_time FROM running_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada'
      });
    }

    if (!sessionCheck.rows[0].is_group_run) {
      return res.status(400).json({
        error: 'Esta não é uma corrida em grupo'
      });
    }

    if (sessionCheck.rows[0].end_time) {
      return res.status(400).json({
        error: 'Corrida já finalizada'
      });
    }

    // Verificar se usuário já é participante
    const participantCheck = await pool.query(
      'SELECT id FROM group_run_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (participantCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Usuário já é participante desta corrida'
      });
    }

    // Adicionar participante
    await pool.query(
      `INSERT INTO group_run_participants (session_id, user_id, status)
       VALUES ($1, $2, 'active')`,
      [sessionId, userId]
    );

    res.json({
      message: 'Participação na corrida confirmada'
    });

  } catch (error) {
    console.error('Erro ao participar da corrida:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// SAIR DE CORRIDA EM GRUPO
// =====================================================
router.post('/sessions/:sessionId/leave', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Verificar se usuário é participante
    const participantCheck = await pool.query(
      'SELECT id FROM group_run_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(400).json({
        error: 'Usuário não é participante desta corrida'
      });
    }

    // Marcar como saído
    await pool.query(
      `UPDATE group_run_participants 
       SET left_at = CURRENT_TIMESTAMP, status = 'left'
       WHERE session_id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    res.json({
      message: 'Saída da corrida confirmada'
    });

  } catch (error) {
    console.error('Erro ao sair da corrida:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 