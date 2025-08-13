const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// =====================================================
// OBTER PERFIL DO USUÁRIO
// =====================================================
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await pool.query(
      `SELECT id, email, name, username, avatar_url, bio, birth_date, gender, 
              weight, height, level, total_distance, total_runs, total_time, 
              average_pace, calories_burned, join_date, last_login, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      user: user.rows[0]
    });

  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// ATUALIZAR PERFIL DO USUÁRIO
// =====================================================
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username deve ter pelo menos 3 caracteres'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio deve ter no máximo 500 caracteres'),
  body('weight').optional().isFloat({ min: 20, max: 300 }).withMessage('Peso deve estar entre 20 e 300 kg'),
  body('height').optional().isFloat({ min: 100, max: 250 }).withMessage('Altura deve estar entre 100 e 250 cm')
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
    const { name, username, bio, birth_date, gender, weight, height } = req.body;

    // Verificar se username já existe (se fornecido)
    if (username) {
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );

      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({
          error: 'Username já está em uso'
        });
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount++}`);
      updateValues.push(name);
    }
    if (username !== undefined) {
      updateFields.push(`username = $${paramCount++}`);
      updateValues.push(username);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCount++}`);
      updateValues.push(bio);
    }
    if (birth_date !== undefined) {
      updateFields.push(`birth_date = $${paramCount++}`);
      updateValues.push(birth_date);
    }
    if (gender !== undefined) {
      updateFields.push(`gender = $${paramCount++}`);
      updateValues.push(gender);
    }
    if (weight !== undefined) {
      updateFields.push(`weight = $${paramCount++}`);
      updateValues.push(weight);
    }
    if (height !== undefined) {
      updateFields.push(`height = $${paramCount++}`);
      updateValues.push(height);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar'
      });
    }

    // Adicionar updated_at e userId
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, username, avatar_url, bio, birth_date, gender, weight, height, updated_at
    `;

    const updatedUser = await pool.query(updateQuery, updateValues);

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER ESTATÍSTICAS DO USUÁRIO
// =====================================================
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Estatísticas gerais
    const generalStats = await pool.query(
      `SELECT total_distance, total_runs, total_time, average_pace, calories_burned, level
       FROM users WHERE id = $1`,
      [userId]
    );

    if (generalStats.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Estatísticas das últimas 4 semanas
    const weeklyStats = await pool.query(
      `SELECT 
         DATE_TRUNC('week', start_time) as week_start,
         COUNT(*) as runs,
         SUM(distance) as total_distance,
         SUM(duration) as total_time,
         AVG(average_pace) as avg_pace,
         SUM(calories) as total_calories
       FROM running_sessions 
       WHERE user_id = $1 
         AND start_time >= CURRENT_DATE - INTERVAL '4 weeks'
       GROUP BY DATE_TRUNC('week', start_time)
       ORDER BY week_start DESC`,
      [userId]
    );

    // Estatísticas mensais
    const monthlyStats = await pool.query(
      `SELECT 
         DATE_TRUNC('month', start_time) as month_start,
         COUNT(*) as runs,
         SUM(distance) as total_distance,
         SUM(duration) as total_time,
         AVG(average_pace) as avg_pace,
         SUM(calories) as total_calories
       FROM running_sessions 
       WHERE user_id = $1 
         AND start_time >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', start_time)
       ORDER BY month_start DESC`,
      [userId]
    );

    // Melhores tempos por distância
    const personalBests = await pool.query(
      `SELECT 
         distance,
         MIN(duration) as best_time,
         MIN(average_pace) as best_pace
       FROM running_sessions 
       WHERE user_id = $1 
         AND end_time IS NOT NULL
       GROUP BY distance
       ORDER BY distance`,
      [userId]
    );

    res.json({
      general: generalStats.rows[0],
      weekly: weeklyStats.rows,
      monthly: monthlyStats.rows,
      personalBests: personalBests.rows
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER HISTÓRICO DE CORRIDAS
// =====================================================
router.get('/runs', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, sort = 'start_time', order = 'desc' } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['start_time', 'distance', 'duration', 'average_pace'];
    const validOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sort)) {
      sort = 'start_time';
    }
    if (!validOrders.includes(order)) {
      order = 'desc';
    }

    // Contar total de corridas
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM running_sessions WHERE user_id = $1',
      [userId]
    );

    const totalRuns = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRuns / limit);

    // Buscar corridas
    const runs = await pool.query(
      `SELECT id, title, description, start_time, end_time, distance, duration,
              average_pace, average_speed, calories, steps, is_group_run
       FROM running_sessions 
       WHERE user_id = $1
       ORDER BY ${sort} ${order.toUpperCase()}
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      runs: runs.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRuns,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao obter histórico de corridas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER CONFIGURAÇÕES DO USUÁRIO
// =====================================================
router.get('/settings', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const settings = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (settings.rows.length === 0) {
      return res.status(404).json({
        error: 'Configurações não encontradas'
      });
    }

    res.json({
      settings: settings.rows[0]
    });

  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// ATUALIZAR CONFIGURAÇÕES DO USUÁRIO
// =====================================================
router.put('/settings', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      notifications_invites,
      notifications_achievements,
      notifications_reminders,
      notifications_challenges,
      privacy_share_location,
      privacy_share_stats,
      privacy_show_online_status,
      units_distance,
      units_pace,
      units_temperature,
      music_auto_sync,
      music_default_volume,
      music_allow_host_control,
      theme
    } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    // Adicionar campos que foram fornecidos
    if (notifications_invites !== undefined) {
      updateFields.push(`notifications_invites = $${paramCount++}`);
      updateValues.push(notifications_invites);
    }
    if (notifications_achievements !== undefined) {
      updateFields.push(`notifications_achievements = $${paramCount++}`);
      updateValues.push(notifications_achievements);
    }
    if (notifications_reminders !== undefined) {
      updateFields.push(`notifications_reminders = $${paramCount++}`);
      updateValues.push(notifications_reminders);
    }
    if (notifications_challenges !== undefined) {
      updateFields.push(`notifications_challenges = $${paramCount++}`);
      updateValues.push(notifications_challenges);
    }
    if (privacy_share_location !== undefined) {
      updateFields.push(`privacy_share_location = $${paramCount++}`);
      updateValues.push(privacy_share_location);
    }
    if (privacy_share_stats !== undefined) {
      updateFields.push(`privacy_share_stats = $${paramCount++}`);
      updateValues.push(privacy_share_stats);
    }
    if (privacy_show_online_status !== undefined) {
      updateFields.push(`privacy_show_online_status = $${paramCount++}`);
      updateValues.push(privacy_show_online_status);
    }
    if (units_distance !== undefined) {
      updateFields.push(`units_distance = $${paramCount++}`);
      updateValues.push(units_distance);
    }
    if (units_pace !== undefined) {
      updateFields.push(`units_pace = $${paramCount++}`);
      updateValues.push(units_pace);
    }
    if (units_temperature !== undefined) {
      updateFields.push(`units_temperature = $${paramCount++}`);
      updateValues.push(units_temperature);
    }
    if (music_auto_sync !== undefined) {
      updateFields.push(`music_auto_sync = $${paramCount++}`);
      updateValues.push(music_auto_sync);
    }
    if (music_default_volume !== undefined) {
      updateFields.push(`music_default_volume = $${paramCount++}`);
      updateValues.push(music_default_volume);
    }
    if (music_allow_host_control !== undefined) {
      updateFields.push(`music_allow_host_control = $${paramCount++}`);
      updateValues.push(music_allow_host_control);
    }
    if (theme !== undefined) {
      updateFields.push(`theme = $${paramCount++}`);
      updateValues.push(theme);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar'
      });
    }

    // Adicionar updated_at e userId
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);

    const updateQuery = `
      UPDATE user_settings 
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const updatedSettings = await pool.query(updateQuery, updateValues);

    res.json({
      message: 'Configurações atualizadas com sucesso',
      settings: updatedSettings.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// BUSCAR USUÁRIOS (para adicionar amigos)
// =====================================================
router.get('/search', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Termo de busca deve ter pelo menos 2 caracteres'
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const offset = (page - 1) * limit;

    // Buscar usuários (excluindo o usuário atual e já amigos)
    const users = await pool.query(
      `SELECT u.id, u.name, u.username, u.avatar_url, u.level, u.total_distance, u.total_runs
       FROM users u
       WHERE u.id != $1 
         AND u.is_active = true
         AND (u.name ILIKE $2 OR u.username ILIKE $2)
         AND u.id NOT IN (
           SELECT CASE 
             WHEN user_id = $1 THEN friend_id 
             ELSE user_id 
           END
           FROM friendships 
           WHERE (user_id = $1 OR friend_id = $1)
         )
       ORDER BY u.name
       LIMIT $3 OFFSET $4`,
      [userId, searchTerm, limit, offset]
    );

    // Contar total de resultados
    const countResult = await pool.query(
      `SELECT COUNT(*) 
       FROM users u
       WHERE u.id != $1 
         AND u.is_active = true
         AND (u.name ILIKE $2 OR u.username ILIKE $2)
         AND u.id NOT IN (
           SELECT CASE 
             WHEN user_id = $1 THEN friend_id 
             ELSE user_id 
           END
           FROM friendships 
           WHERE (user_id = $1 OR friend_id = $1)
         )`,
      [userId, searchTerm]
    );

    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: users.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro na busca de usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 