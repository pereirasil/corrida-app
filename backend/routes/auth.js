const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const config = require('../config/env');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de novo usuário
 *     description: Cria uma nova conta de usuário no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Senha do usuário (mínimo 6 caracteres)
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nome completo do usuário
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 description: Nome de usuário único (opcional)
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento (opcional)
 *               gender:
 *                 type: string
 *                 description: Gênero (opcional)
 *               weight:
 *                 type: number
 *                 description: Peso em kg (opcional)
 *               height:
 *                 type: number
 *                 description: Altura em cm (opcional)
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário criado com sucesso
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('name').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Username deve ter pelo menos 3 caracteres')
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

    const { email, password, name, username, birth_date, gender, weight, height } = req.body;

    // Verificar se email já existe
    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        error: 'Email já está em uso'
      });
    }

    // Verificar se username já existe (se fornecido)
    if (username) {
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [username]
      );

      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({
          error: 'Username já está em uso'
        });
      }
    }

    // Hash da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Inserir usuário
    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash, name, username, birth_date, gender, weight, height)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, name, username, level, join_date, created_at`,
      [email, passwordHash, name, username, birth_date, gender, weight, height]
    );

    // Criar configurações padrão do usuário
    await pool.query(
      'INSERT INTO user_settings (user_id) VALUES ($1)',
      [newUser.rows[0].id]
    );

    // Gerar token JWT
    const token = jwt.sign(
      { userId: newUser.rows[0].id },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        name: newUser.rows[0].name,
        username: newUser.rows[0].username,
        level: newUser.rows[0].level,
        join_date: newUser.rows[0].join_date
      },
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     description: Autentica um usuário existente e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *               password:
 *                 type: string
 *                 description: Senha do usuário
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login realizado com sucesso
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
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

    const { email, password } = req.body;

    // Buscar usuário
    const user = await pool.query(
      `SELECT id, email, password_hash, name, username, level, is_active, 
              total_distance, total_runs, average_pace, calories_burned
       FROM users WHERE email = $1`,
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    const userData = user.rows[0];

    // Verificar se usuário está ativo
    if (!userData.is_active) {
      return res.status(401).json({
        error: 'Conta desativada'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Email ou senha incorretos'
      });
    }

    // Atualizar último login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userData.id]
    );

    // Gerar token JWT
    const token = jwt.sign(
      { userId: userData.id },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        level: userData.level,
        stats: {
          total_distance: userData.total_distance,
          total_runs: userData.total_runs,
          average_pace: userData.average_pace,
          calories_burned: userData.calories_burned
        }
      },
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     description: Valida um token JWT e retorna os dados do usuário
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT id, email, name, username, level, is_active, 
              total_distance, total_runs, average_pace, calories_burned
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      });
    }

    const userData = user.rows[0];

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        level: userData.level,
        stats: {
          total_distance: userData.total_distance,
          total_runs: userData.total_runs,
          average_pace: userData.average_pace,
          calories_burned: userData.calories_burned
        }
      }
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Alterar senha
 *     description: Permite ao usuário alterar sua senha atual
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Senha atual do usuário
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Nova senha (mínimo 6 caracteres)
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Senha alterada com sucesso
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Senha atual incorreta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter pelo menos 6 caracteres')
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

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Buscar senha atual
    const user = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro na alteração de senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout do usuário
 *     description: Invalida o token JWT do usuário (implementação no cliente)
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout realizado com sucesso
 */
router.post('/logout', auth, (req, res) => {
  res.json({
    message: 'Logout realizado com sucesso'
  });
});

module.exports = router; 