const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// =====================================================
// CRIAR SESSÃO DE MÚSICA
// =====================================================
router.post('/sessions', auth, [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Nome deve ter entre 1 e 255 caracteres'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('is_public').optional().isBoolean().withMessage('is_public deve ser um booleano'),
  body('max_participants').optional().isInt({ min: 2, max: 50 }).withMessage('Máximo de participantes deve estar entre 2 e 50')
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
    const { name, description, is_public = true, max_participants = 10 } = req.body;

    // Criar nova sessão de música
    const newSession = await pool.query(
      `INSERT INTO music_sessions (host_id, name, description, is_public, max_participants)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, host_id, is_public, max_participants, created_at`,
      [userId, name, description, is_public, max_participants]
    );

    // Adicionar host como participante
    await pool.query(
      `INSERT INTO music_session_participants (session_id, user_id)
       VALUES ($1, $2)`,
      [newSession.rows[0].id, userId]
    );

    res.status(201).json({
      message: 'Sessão de música criada com sucesso',
      session: newSession.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar sessão de música:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER SESSÕES DE MÚSICA PÚBLICAS
// =====================================================
router.get('/sessions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    // Construir query base
    let whereClause = 'WHERE ms.is_public = true';
    let queryParams = [];
    let paramCount = 0;

    if (search && search.trim().length > 0) {
      whereClause += ' AND (ms.name ILIKE $1 OR ms.description ILIKE $1)';
      queryParams.push(`%${search.trim()}%`);
      paramCount++;
    }

    // Contar total de sessões
    const countQuery = `
      SELECT COUNT(*) 
      FROM music_sessions ms
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);

    const totalSessions = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalSessions / limit);

    // Buscar sessões
    const sessionsQuery = `
      SELECT ms.*, 
             u.name as host_name, u.username as host_username, u.avatar_url as host_avatar,
             COUNT(msp.user_id) as current_participants
      FROM music_sessions ms
      JOIN users u ON ms.host_id = u.id
      LEFT JOIN music_session_participants msp ON ms.id = msp.session_id
      ${whereClause}
      GROUP BY ms.id, u.name, u.username, u.avatar_url
      ORDER BY ms.created_at DESC
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
    console.error('Erro ao obter sessões de música:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER SESSÃO DE MÚSICA ESPECÍFICA
// =====================================================
router.get('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Verificar se a sessão existe e é pública ou o usuário é participante
    const session = await pool.query(
      `SELECT ms.*, 
              u.name as host_name, u.username as host_username, u.avatar_url as host_avatar
       FROM music_sessions ms
       JOIN users u ON ms.host_id = u.id
       WHERE ms.id = $1 AND (ms.is_public = true OR ms.host_id = $2 OR 
             EXISTS (SELECT 1 FROM music_session_participants WHERE session_id = ms.id AND user_id = $2))`,
      [sessionId, userId]
    );

    if (session.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada'
      });
    }

    // Buscar participantes
    const participants = await pool.query(
      `SELECT msp.*, u.name, u.username, u.avatar_url
       FROM music_session_participants msp
       JOIN users u ON msp.user_id = u.id
       WHERE msp.session_id = $1
       ORDER BY msp.joined_at ASC`,
      [sessionId]
    );

    // Buscar playlist
    const playlist = await pool.query(
      `SELECT * FROM playlists 
       WHERE session_id = $1
       ORDER BY position ASC, added_at ASC`,
      [sessionId]
    );

    res.json({
      session: {
        ...session.rows[0],
        participants: participants.rows,
        playlist: playlist.rows
      }
    });

  } catch (error) {
    console.error('Erro ao obter sessão de música:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// PARTICIPAR DE SESSÃO DE MÚSICA
// =====================================================
router.post('/sessions/:sessionId/join', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Verificar se a sessão existe e é pública
    const sessionCheck = await pool.query(
      'SELECT id, is_public, max_participants FROM music_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada'
      });
    }

    if (!sessionCheck.rows[0].is_public) {
      return res.status(403).json({
        error: 'Sessão não é pública'
      });
    }

    // Verificar se usuário já é participante
    const participantCheck = await pool.query(
      'SELECT id FROM music_session_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (participantCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Usuário já é participante desta sessão'
      });
    }

    // Verificar limite de participantes
    const currentParticipants = await pool.query(
      'SELECT COUNT(*) FROM music_session_participants WHERE session_id = $1',
      [sessionId]
    );

    if (parseInt(currentParticipants.rows[0].count) >= sessionCheck.rows[0].max_participants) {
      return res.status(400).json({
        error: 'Sessão está cheia'
      });
    }

    // Adicionar participante
    await pool.query(
      `INSERT INTO music_session_participants (session_id, user_id)
       VALUES ($1, $2)`,
      [sessionId, userId]
    );

    res.json({
      message: 'Participação na sessão confirmada'
    });

  } catch (error) {
    console.error('Erro ao participar da sessão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// SAIR DE SESSÃO DE MÚSICA
// =====================================================
router.post('/sessions/:sessionId/leave', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Verificar se usuário é participante
    const participantCheck = await pool.query(
      'SELECT id FROM music_session_participants WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(400).json({
        error: 'Usuário não é participante desta sessão'
      });
    }

    // Verificar se é o host
    const sessionCheck = await pool.query(
      'SELECT host_id FROM music_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rows[0].host_id === userId) {
      return res.status(400).json({
        error: 'Host não pode sair da sessão. Transfira a hostia ou encerre a sessão.'
      });
    }

    // Remover participante
    await pool.query(
      `UPDATE music_session_participants 
       SET left_at = CURRENT_TIMESTAMP
       WHERE session_id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    res.json({
      message: 'Saída da sessão confirmada'
    });

  } catch (error) {
    console.error('Erro ao sair da sessão:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// ADICIONAR MÚSICA À PLAYLIST
// =====================================================
router.post('/sessions/:sessionId/playlist', auth, [
  body('track_id').notEmpty().withMessage('ID da música é obrigatório'),
  body('title').notEmpty().trim().isLength({ max: 255 }).withMessage('Título é obrigatório e deve ter no máximo 255 caracteres'),
  body('artist').notEmpty().trim().isLength({ max: 255 }).withMessage('Artista é obrigatório e deve ter no máximo 255 caracteres'),
  body('album').optional().trim().isLength({ max: 255 }).withMessage('Álbum deve ter no máximo 255 caracteres'),
  body('duration').isInt({ min: 1 }).withMessage('Duração deve ser um número inteiro positivo'),
  body('url').optional().isURL().withMessage('URL deve ser válida'),
  body('artwork_url').optional().isURL().withMessage('URL da arte deve ser válida'),
  body('genre').optional().trim().isLength({ max: 100 }).withMessage('Gênero deve ter no máximo 100 caracteres')
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
    const trackData = req.body;

    // Verificar se a sessão existe e o usuário é participante
    const sessionCheck = await pool.query(
      `SELECT id FROM music_sessions ms
       WHERE ms.id = $1 AND (
         ms.host_id = $2 OR 
         EXISTS (SELECT 1 FROM music_session_participants WHERE session_id = ms.id AND user_id = $2)
       )`,
      [sessionId, userId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada ou acesso negado'
      });
    }

    // Obter próxima posição
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM playlists WHERE session_id = $1',
      [sessionId]
    );

    const nextPosition = positionResult.rows[0].next_position;

    // Adicionar música à playlist
    const newTrack = await pool.query(
      `INSERT INTO playlists (session_id, track_id, title, artist, album, duration, url, artwork_url, genre, added_by, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [sessionId, trackData.track_id, trackData.title, trackData.artist, trackData.album, 
       trackData.duration, trackData.url, trackData.artwork_url, trackData.genre, userId, nextPosition]
    );

    res.status(201).json({
      message: 'Música adicionada à playlist com sucesso',
      track: newTrack.rows[0]
    });

  } catch (error) {
    console.error('Erro ao adicionar música à playlist:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// REMOVER MÚSICA DA PLAYLIST
// =====================================================
router.delete('/sessions/:sessionId/playlist/:trackId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId, trackId } = req.params;

    // Verificar se a sessão existe e o usuário é host ou adicionou a música
    const trackCheck = await pool.query(
      `SELECT p.*, ms.host_id 
       FROM playlists p
       JOIN music_sessions ms ON p.session_id = ms.id
       WHERE p.session_id = $1 AND p.track_id = $2`,
      [sessionId, trackId]
    );

    if (trackCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Música não encontrada'
      });
    }

    const track = trackCheck.rows[0];
    
    // Verificar permissão (host ou quem adicionou)
    if (track.host_id !== userId && track.added_by !== userId) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Remover música
    await pool.query(
      'DELETE FROM playlists WHERE session_id = $1 AND track_id = $2',
      [sessionId, trackId]
    );

    // Reordenar posições
    await pool.query(
      `UPDATE playlists 
       SET position = position - 1
       WHERE session_id = $1 AND position > $2`,
      [sessionId, track.position]
    );

    res.json({
      message: 'Música removida da playlist com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover música da playlist:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// CONTROLAR REPRODUÇÃO (apenas host)
// =====================================================
router.put('/sessions/:sessionId/control', auth, [
  body('action').isIn(['play', 'pause', 'next', 'previous', 'seek']).withMessage('Ação inválida'),
  body('current_time').optional().isInt({ min: 0 }).withMessage('Tempo atual deve ser um número inteiro positivo'),
  body('volume').optional().isFloat({ min: 0, max: 1 }).withMessage('Volume deve estar entre 0 e 1'),
  body('current_track_id').optional().notEmpty().withMessage('ID da música atual é obrigatório para algumas ações')
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
    const { action, current_time, volume, current_track_id } = req.body;

    // Verificar se a sessão existe e o usuário é host
    const sessionCheck = await pool.query(
      'SELECT id, host_id FROM music_sessions WHERE id = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Sessão não encontrada'
      });
    }

    if (sessionCheck.rows[0].host_id !== userId) {
      return res.status(403).json({
        error: 'Apenas o host pode controlar a reprodução'
      });
    }

    // Atualizar estado da sessão
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (action === 'play') {
      updateFields.push(`is_playing = true`);
    } else if (action === 'pause') {
      updateFields.push(`is_playing = false`);
    }

    if (current_time !== undefined) {
      updateFields.push(`current_time = $${paramCount++}`);
      updateValues.push(current_time);
    }

    if (volume !== undefined) {
      updateFields.push(`volume = $${paramCount++}`);
      updateValues.push(volume);
    }

    if (current_track_id !== undefined) {
      updateFields.push(`current_track_id = $${paramCount++}`);
      updateValues.push(current_track_id);
    }

    if (updateFields.length === 0) {
      updateFields.push(`is_playing = ${action === 'play' ? 'true' : 'false'}`);
    }

    // Adicionar updated_at e sessionId
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(sessionId);

    const updateQuery = `
      UPDATE music_sessions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const updatedSession = await pool.query(updateQuery, updateValues);

    res.json({
      message: `Ação '${action}' executada com sucesso`,
      session: updatedSession.rows[0]
    });

  } catch (error) {
    console.error('Erro ao controlar reprodução:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 