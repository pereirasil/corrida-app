const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// =====================================================
// OBTER CONQUISTAS DO USUÁRIO
// =====================================================
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, category } = req.query;

    const offset = (page - 1) * limit;

    // Construir query base
    let whereClause = 'WHERE a.user_id = $1';
    let queryParams = [userId];
    let paramCount = 1;

    if (category) {
      whereClause += ` AND a.category = $${paramCount + 1}`;
      queryParams.push(category);
      paramCount++;
    }

    // Contar total de conquistas
    const countQuery = `SELECT COUNT(*) FROM achievements a ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);

    const totalAchievements = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalAchievements / limit);

    // Buscar conquistas
    const achievementsQuery = `
      SELECT a.*, 
             CASE 
               WHEN a.is_unlocked = true THEN 'unlocked'
               WHEN a.progress >= a.target THEN 'ready_to_unlock'
               ELSE 'in_progress'
             END as status
      FROM achievements a
      ${whereClause}
      ORDER BY a.is_unlocked DESC, a.progress DESC, a.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const achievements = await pool.query(achievementsQuery, queryParams);

    res.json({
      achievements: achievements.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalAchievements,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao obter conquistas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER CONQUISTAS DISPONÍVEIS
// =====================================================
router.get('/available', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category } = req.query;

    // Construir query base
    let whereClause = 'WHERE a.user_id = $1 AND a.is_unlocked = false';
    let queryParams = [userId];

    if (category) {
      whereClause += ' AND a.category = $2';
      queryParams.push(category);
    }

    // Buscar conquistas disponíveis
    const achievements = await pool.query(
      `SELECT a.*, 
             100.0 * a.progress / a.target as progress_percentage
       FROM achievements a
       ${whereClause}
       ORDER BY a.category, a.target ASC`,
      queryParams
    );

    res.json({
      achievements: achievements.rows
    });

  } catch (error) {
    console.error('Erro ao obter conquistas disponíveis:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER ESTATÍSTICAS DE CONQUISTAS
// =====================================================
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Estatísticas gerais
    const generalStats = await pool.query(
      `SELECT 
         COUNT(*) as total_achievements,
         COUNT(CASE WHEN is_unlocked = true THEN 1 END) as unlocked_achievements,
         COUNT(CASE WHEN is_unlocked = false THEN 1 END) as locked_achievements,
         COUNT(CASE WHEN progress >= target AND is_unlocked = false THEN 1 END) as ready_to_unlock
       FROM achievements 
       WHERE user_id = $1`,
      [userId]
    );

    // Estatísticas por categoria
    const categoryStats = await pool.query(
      `SELECT 
         category,
         COUNT(*) as total,
         COUNT(CASE WHEN is_unlocked = true THEN 1 END) as unlocked,
         ROUND(100.0 * COUNT(CASE WHEN is_unlocked = true THEN 1 END) / COUNT(*), 2) as completion_rate
       FROM achievements 
       WHERE user_id = $1
       GROUP BY category
       ORDER BY category`,
      [userId]
    );

    // Conquistas recentes
    const recentAchievements = await pool.query(
      `SELECT title, description, icon, category, unlocked_at
       FROM achievements 
       WHERE user_id = $1 AND is_unlocked = true
       ORDER BY unlocked_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      general: generalStats.rows[0],
      byCategory: categoryStats.rows,
      recent: recentAchievements.rows
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de conquistas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// CRIAR DESAFIO
// =====================================================
router.post('/challenges', auth, [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Título deve ter entre 1 e 255 caracteres'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('type').isIn(['distance', 'time', 'pace', 'streak']).withMessage('Tipo deve ser distance, time, pace ou streak'),
  body('target_value').isFloat({ min: 0.1 }).withMessage('Valor alvo deve ser um número positivo'),
  body('unit').trim().isLength({ min: 1, max: 20 }).withMessage('Unidade é obrigatória'),
  body('start_date').isISO8601().withMessage('Data de início deve ser uma data válida'),
  body('end_date').isISO8601().withMessage('Data de fim deve ser uma data válida'),
  body('is_public').optional().isBoolean().withMessage('is_public deve ser um booleano')
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
    const { title, description, type, target_value, unit, start_date, end_date, is_public = true } = req.body;

    // Verificar se as datas são válidas
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const now = new Date();

    if (startDate <= now) {
      return res.status(400).json({
        error: 'Data de início deve ser no futuro'
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        error: 'Data de fim deve ser posterior à data de início'
      });
    }

    // Criar novo desafio
    const newChallenge = await pool.query(
      `INSERT INTO challenges (title, description, type, target_value, unit, start_date, end_date, created_by, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, type, target_value, unit, start_date, end_date, userId, is_public]
    );

    // Adicionar criador como participante
    await pool.query(
      `INSERT INTO challenge_participants (challenge_id, user_id, progress)
       VALUES ($1, $2, 0)`,
      [newChallenge.rows[0].id, userId]
    );

    res.status(201).json({
      message: 'Desafio criado com sucesso',
      challenge: newChallenge.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar desafio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER DESAFIOS DISPONÍVEIS
// =====================================================
router.get('/challenges', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type, status = 'active' } = req.query;

    const offset = (page - 1) * limit;

    // Construir query base
    let whereClause = 'WHERE c.is_public = true';
    let queryParams = [];
    let paramCount = 0;

    if (type) {
      whereClause += ` AND c.type = $${paramCount + 1}`;
      queryParams.push(type);
      paramCount++;
    }

    if (status === 'active') {
      whereClause += ` AND c.start_date <= CURRENT_TIMESTAMP AND c.end_date >= CURRENT_TIMESTAMP AND c.is_active = true`;
    } else if (status === 'upcoming') {
      whereClause += ` AND c.start_date > CURRENT_TIMESTAMP`;
    } else if (status === 'completed') {
      whereClause += ` AND c.end_date < CURRENT_TIMESTAMP`;
    }

    // Contar total de desafios
    const countQuery = `SELECT COUNT(*) FROM challenges c ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);

    const totalChallenges = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalChallenges / limit);

    // Buscar desafios
    const challengesQuery = `
      SELECT c.*, 
             u.name as creator_name, u.username as creator_username,
             COUNT(cp.user_id) as participants_count,
             CASE 
               WHEN cp.user_id IS NOT NULL THEN 'participating'
               WHEN c.start_date > CURRENT_TIMESTAMP THEN 'not_started'
               WHEN c.end_date < CURRENT_TIMESTAMP THEN 'ended'
               ELSE 'can_join'
             END as user_status,
             cp.progress as user_progress
      FROM challenges c
      JOIN users u ON c.created_by = u.id
      LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id AND cp.user_id = $${paramCount + 1}
      ${whereClause}
      GROUP BY c.id, u.name, u.username, cp.user_id, cp.progress
      ORDER BY c.start_date ASC
      LIMIT $${paramCount + 2} OFFSET $${paramCount + 3}
    `;

    queryParams.push(userId, limit, offset);
    const challenges = await pool.query(challengesQuery, queryParams);

    res.json({
      challenges: challenges.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalChallenges,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao obter desafios:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// PARTICIPAR DE DESAFIO
// =====================================================
router.post('/challenges/:challengeId/join', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { challengeId } = req.params;

    // Verificar se o desafio existe e está ativo
    const challenge = await pool.query(
      'SELECT id, start_date, end_date, is_active FROM challenges WHERE id = $1',
      [challengeId]
    );

    if (challenge.rows.length === 0) {
      return res.status(404).json({
        error: 'Desafio não encontrado'
      });
    }

    const challengeData = challenge.rows[0];

    if (!challengeData.is_active) {
      return res.status(400).json({
        error: 'Desafio não está ativo'
      });
    }

    if (new Date() < challengeData.start_date) {
      return res.status(400).json({
        error: 'Desafio ainda não começou'
      });
    }

    if (new Date() > challengeData.end_date) {
      return res.status(400).json({
        error: 'Desafio já terminou'
      });
    }

    // Verificar se usuário já é participante
    const participantCheck = await pool.query(
      'SELECT id FROM challenge_participants WHERE challenge_id = $1 AND user_id = $2',
      [challengeId, userId]
    );

    if (participantCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Usuário já é participante deste desafio'
      });
    }

    // Adicionar participante
    await pool.query(
      `INSERT INTO challenge_participants (challenge_id, user_id, progress)
       VALUES ($1, $2, 0)`,
      [challengeId, userId]
    );

    res.json({
      message: 'Participação no desafio confirmada'
    });

  } catch (error) {
    console.error('Erro ao participar do desafio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER RANKING DO DESAFIO
// =====================================================
router.get('/challenges/:challengeId/ranking', auth, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (page - 1) * limit;

    // Verificar se o desafio existe
    const challenge = await pool.query(
      'SELECT id, title, type, target_value, unit FROM challenges WHERE id = $1',
      [challengeId]
    );

    if (challenge.rows.length === 0) {
      return res.status(404).json({
        error: 'Desafio não encontrado'
      });
    }

    // Contar total de participantes
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM challenge_participants WHERE challenge_id = $1',
      [challengeId]
    );

    const totalParticipants = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalParticipants / limit);

    // Buscar ranking
    const ranking = await pool.query(
      `SELECT cp.*, 
              u.name, u.username, u.avatar_url,
              ROUND(100.0 * cp.progress / c.target_value, 2) as completion_percentage
       FROM challenge_participants cp
       JOIN challenges c ON cp.challenge_id = c.id
       JOIN users u ON cp.user_id = u.id
       WHERE cp.challenge_id = $1
       ORDER BY cp.progress DESC, cp.joined_at ASC
       LIMIT $2 OFFSET $3`,
      [challengeId, limit, offset]
    );

    // Calcular posições
    const rankingWithPositions = ranking.rows.map((participant, index) => ({
      ...participant,
      rank: offset + index + 1
    }));

    res.json({
      challenge: challenge.rows[0],
      ranking: rankingWithPositions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalParticipants,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao obter ranking do desafio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// ATUALIZAR PROGRESSO DO DESAFIO
// =====================================================
router.put('/challenges/:challengeId/progress', auth, [
  body('progress').isFloat({ min: 0 }).withMessage('Progresso deve ser um número positivo')
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
    const { challengeId } = req.params;
    const { progress } = req.body;

    // Verificar se o usuário é participante
    const participant = await pool.query(
      'SELECT id, progress FROM challenge_participants WHERE challenge_id = $1 AND user_id = $2',
      [challengeId, userId]
    );

    if (participant.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não é participante deste desafio'
      });
    }

    // Atualizar progresso
    await pool.query(
      `UPDATE challenge_participants 
       SET progress = $1
       WHERE challenge_id = $2 AND user_id = $3`,
      [progress, challengeId, userId]
    );

    // Verificar se completou o desafio
    const challenge = await pool.query(
      'SELECT target_value FROM challenges WHERE id = $1',
      [challengeId]
    );

    if (progress >= challenge.rows[0].target_value) {
      // Atualizar ranking
      await pool.query(
        `UPDATE challenge_participants 
         SET rank = (
           SELECT rank_position 
           FROM (
             SELECT user_id, ROW_NUMBER() OVER (ORDER BY progress DESC, joined_at ASC) as rank_position
             FROM challenge_participants 
             WHERE challenge_id = $1
           ) ranked
           WHERE user_id = $2
         )
         WHERE challenge_id = $1 AND user_id = $2`,
        [challengeId, userId]
      );
    }

    res.json({
      message: 'Progresso atualizado com sucesso',
      progress
    });

  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 