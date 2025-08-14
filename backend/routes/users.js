const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// =====================================================
// BUSCAR TODOS OS USUÁRIOS (para adicionar amigos)
// =====================================================
router.get('/search', auth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { search, page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Construir query base para buscar usuários
    let whereClause = 'WHERE u.is_active = true AND u.id != $1';
    let queryParams = [currentUserId];
    let paramCount = 1;

    // Adicionar filtro de pesquisa se fornecido
    if (search && search.trim().length > 0) {
      whereClause += ` AND (u.name ILIKE $${paramCount + 1} OR u.username ILIKE $${paramCount + 1})`;
      queryParams.push(`%${search.trim()}%`);
      paramCount++;
    }

    // Contar total de usuários
    const countQuery = `
      SELECT COUNT(*) 
      FROM users u
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams);
    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    // Buscar usuários com informações de amizade
    const usersQuery = `
      SELECT 
        u.id, u.name, u.username, u.avatar_url, u.level, 
        u.total_distance, u.total_runs, u.last_login,
        CASE 
          WHEN f.status = 'accepted' THEN 'friend'
          WHEN f.status = 'pending' AND f.user_id = $1 THEN 'invite_sent'
          WHEN f.status = 'pending' AND f.friend_id = $1 THEN 'invite_received'
          WHEN f.status = 'blocked' THEN 'blocked'
          ELSE 'none'
        END as friendship_status,
        f.id as friendship_id
      FROM users u
      LEFT JOIN friendships f ON (
        (f.user_id = $1 AND f.friend_id = u.id) OR 
        (f.friend_id = $1 AND f.user_id = u.id)
      )
      ${whereClause}
      ORDER BY u.name
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const users = await pool.query(usersQuery, queryParams);

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
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER PERFIL DO USUÁRIO ATUAL
// =====================================================
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await pool.query(
      `SELECT id, name, username, email, avatar_url, level, 
              total_distance, total_runs, total_time, average_pace,
              created_at, last_login
       FROM users WHERE id = $1 AND is_active = true`,
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
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('username').optional().trim().isLength({ min: 3, max: 30 }).withMessage('Username deve ter entre 3 e 30 caracteres'),
  body('avatar_url').optional().isURL().withMessage('Avatar deve ser uma URL válida')
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
    const updateData = req.body;

    // Verificar se username já existe (se estiver sendo alterado)
    if (updateData.username) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [updateData.username, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          error: 'Username já está em uso'
        });
      }
    }

    // Construir query de atualização dinamicamente
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        updateFields.push(`${key} = $${paramCount + 1}`);
        updateValues.push(updateData[key]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar'
      });
    }

    // Adicionar updated_at e userId
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(userId);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount + 1}
      RETURNING id, name, username, email, avatar_url, level, 
                total_distance, total_runs, total_time, average_pace,
                created_at, last_login, updated_at
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
// EXCLUIR CONTA DO USUÁRIO
// =====================================================
router.delete('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Verificar se o usuário tem sessões de corrida ativas
    const activeSessions = await pool.query(
      'SELECT id FROM running_sessions WHERE user_id = $1 AND end_time IS NULL',
      [userId]
    );

    if (activeSessions.rows.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir a conta com sessões de corrida ativas'
      });
    }

    // Desativar usuário (soft delete)
    await pool.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.json({
      message: 'Conta excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir conta:', error);
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

module.exports = router; 