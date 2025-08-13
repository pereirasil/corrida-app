const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// =====================================================
// ENVIAR SOLICITAÇÃO DE AMIZADE
// =====================================================
router.post('/requests', auth, [
  body('friend_id').isUUID().withMessage('ID do amigo deve ser um UUID válido'),
  body('message').optional().trim().isLength({ max: 500 }).withMessage('Mensagem deve ter no máximo 500 caracteres')
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
    const { friend_id, message } = req.body;

    // Verificar se não está tentando adicionar a si mesmo
    if (userId === friend_id) {
      return res.status(400).json({
        error: 'Não é possível adicionar a si mesmo como amigo'
      });
    }

    // Verificar se o usuário alvo existe
    const targetUser = await pool.query(
      'SELECT id, name, username FROM users WHERE id = $1 AND is_active = true',
      [friend_id]
    );

    if (targetUser.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se já existe uma solicitação ou amizade
    const existingFriendship = await pool.query(
      'SELECT id, status FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friend_id]
    );

    if (existingFriendship.rows.length > 0) {
      const friendship = existingFriendship.rows[0];
      
      if (friendship.status === 'accepted') {
        return res.status(400).json({
          error: 'Vocês já são amigos'
        });
      } else if (friendship.status === 'pending') {
        return res.status(400).json({
          error: 'Já existe uma solicitação pendente'
        });
      } else if (friendship.status === 'blocked') {
        return res.status(400).json({
          error: 'Usuário bloqueado'
        });
      }
    }

    // Criar solicitação de amizade
    const newFriendship = await pool.query(
      `INSERT INTO friendships (user_id, friend_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, friend_id, message, status, created_at`,
      [userId, friend_id, message]
    );

    res.status(201).json({
      message: 'Solicitação de amizade enviada com sucesso',
      friendship: newFriendship.rows[0]
    });

  } catch (error) {
    console.error('Erro ao enviar solicitação de amizade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER SOLICITAÇÕES DE AMIZADE PENDENTES
// =====================================================
router.get('/requests', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Contar total de solicitações pendentes
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM friendships WHERE friend_id = $1 AND status = $2',
      [userId, 'pending']
    );

    const totalRequests = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalRequests / limit);

    // Buscar solicitações pendentes
    const requests = await pool.query(
      `SELECT f.*, 
              u.name, u.username, u.avatar_url, u.level, u.total_distance, u.total_runs
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      requests: requests.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRequests,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao obter solicitações de amizade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// RESPONDER SOLICITAÇÃO DE AMIZADE
// =====================================================
router.put('/requests/:friendshipId', auth, [
  body('action').isIn(['accept', 'decline']).withMessage('Ação deve ser "accept" ou "decline"')
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
    const { friendshipId } = req.params;
    const { action } = req.body;

    // Verificar se a solicitação existe e é para o usuário atual
    const friendship = await pool.query(
      'SELECT id, user_id, friend_id, status FROM friendships WHERE id = $1 AND friend_id = $2 AND status = $3',
      [friendshipId, userId, 'pending']
    );

    if (friendship.rows.length === 0) {
      return res.status(404).json({
        error: 'Solicitação não encontrada'
      });
    }

    const friendshipData = friendship.rows[0];
    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    // Atualizar status da amizade
    await pool.query(
      'UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, friendshipId]
    );

    res.json({
      message: `Solicitação ${action === 'accept' ? 'aceita' : 'recusada'} com sucesso`,
      status: newStatus
    });

  } catch (error) {
    console.error('Erro ao responder solicitação de amizade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER LISTA DE AMIGOS
// =====================================================
router.get('/list', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, search } = req.query;

    const offset = (page - 1) * limit;

    // Construir query base
    let whereClause = `WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'`;
    let queryParams = [userId];
    let paramCount = 1;

    if (search && search.trim().length > 0) {
      whereClause += ` AND (u.name ILIKE $${paramCount + 1} OR u.username ILIKE $${paramCount + 1})`;
      queryParams.push(`%${search.trim()}%`);
      paramCount++;
    }

    // Contar total de amigos
    const countQuery = `
      SELECT COUNT(*) 
      FROM friendships f
      JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
      WHERE (f.user_id = $1 OR f.friend_id = $1) 
        AND f.status = 'accepted' 
        AND u.id != $1
        ${search ? `AND (u.name ILIKE $2 OR u.username ILIKE $2)` : ''}
    `;
    
    const countResult = await pool.query(countQuery, queryParams);
    const totalFriends = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalFriends / limit);

    // Buscar amigos
    const friendsQuery = `
      SELECT u.id, u.name, u.username, u.avatar_url, u.level, 
             u.total_distance, u.total_runs, u.last_login,
             f.created_at as friendship_date
      FROM friendships f
      JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
      ${whereClause}
        AND u.id != $1
      ORDER BY u.name
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);
    const friends = await pool.query(friendsQuery, queryParams);

    res.json({
      friends: friends.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalFriends,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Erro ao obter lista de amigos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// REMOVER AMIGO
// =====================================================
router.delete('/:friendshipId', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { friendshipId } = req.params;

    // Verificar se a amizade existe e envolve o usuário atual
    const friendship = await pool.query(
      'SELECT id, user_id, friend_id FROM friendships WHERE id = $1 AND ((user_id = $2 AND friend_id != $2) OR (friend_id = $2 AND user_id != $2))',
      [friendshipId, userId]
    );

    if (friendship.rows.length === 0) {
      return res.status(404).json({
        error: 'Amizade não encontrada'
      });
    }

    // Remover amizade
    await pool.query(
      'DELETE FROM friendships WHERE id = $1',
      [friendshipId]
    );

    res.json({
      message: 'Amigo removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover amigo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// BLOQUEAR USUÁRIO
// =====================================================
router.post('/block/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { userId: targetUserId } = req.params;

    // Verificar se não está tentando bloquear a si mesmo
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        error: 'Não é possível bloquear a si mesmo'
      });
    }

    // Verificar se o usuário alvo existe
    const targetUser = await pool.query(
      'SELECT id, name FROM users WHERE id = $1 AND is_active = true',
      [targetUserId]
    );

    if (targetUser.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Verificar se já existe uma relação
    const existingFriendship = await pool.query(
      'SELECT id, status FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [currentUserId, targetUserId]
    );

    if (existingFriendship.rows.length > 0) {
      // Atualizar status para bloqueado
      await pool.query(
        'UPDATE friendships SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['blocked', existingFriendship.rows[0].id]
      );
    } else {
      // Criar nova relação bloqueada
      await pool.query(
        `INSERT INTO friendships (user_id, friend_id, status)
         VALUES ($1, $2, 'blocked')`,
        [currentUserId, targetUserId]
      );
    }

    res.json({
      message: 'Usuário bloqueado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao bloquear usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// DESBLOQUEAR USUÁRIO
// =====================================================
router.post('/unblock/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { userId: targetUserId } = req.params;

    // Verificar se existe uma relação bloqueada
    const blockedFriendship = await pool.query(
      'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2 AND status = $3',
      [currentUserId, targetUserId, 'blocked']
    );

    if (blockedFriendship.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não está bloqueado'
      });
    }

    // Remover relação bloqueada
    await pool.query(
      'DELETE FROM friendships WHERE id = $1',
      [blockedFriendship.rows[0].id]
    );

    res.json({
      message: 'Usuário desbloqueado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desbloquear usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// =====================================================
// OBTER ESTATÍSTICAS DE AMIZADES
// =====================================================
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Contar amigos
    const friendsCount = await pool.query(
      'SELECT COUNT(*) FROM friendships WHERE (user_id = $1 OR friend_id = $1) AND status = $2',
      [userId, 'accepted']
    );

    // Contar solicitações pendentes recebidas
    const pendingReceivedCount = await pool.query(
      'SELECT COUNT(*) FROM friendships WHERE friend_id = $1 AND status = $2',
      [userId, 'pending']
    );

    // Contar solicitações pendentes enviadas
    const pendingSentCount = await pool.query(
      'SELECT COUNT(*) FROM friendships WHERE user_id = $1 AND status = $2',
      [userId, 'pending']
    );

    // Contar usuários bloqueados
    const blockedCount = await pool.query(
      'SELECT COUNT(*) FROM friendships WHERE user_id = $1 AND status = $2',
      [userId, 'blocked']
    );

    res.json({
      stats: {
        totalFriends: parseInt(friendsCount.rows[0].count),
        pendingReceived: parseInt(pendingReceivedCount.rows[0].count),
        pendingSent: parseInt(pendingSentCount.rows[0].count),
        blockedUsers: parseInt(blockedCount.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de amizades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router; 