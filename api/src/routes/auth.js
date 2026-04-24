const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, nome: user.nome, cargo: user.cargo },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuário e obter token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@agrotech.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 token: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     cargo: { type: string }
 *       401:
 *         description: Credenciais inválidas
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido.'),
    body('password').notEmpty().withMessage('Senha obrigatória.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg, code: 400 });
    }

    const { email, password } = req.body;

    try {
      const { rows } = await pool.query(
        'SELECT id, nome, email, senha, cargo FROM usuarios WHERE email = $1',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Credenciais inválidas.', code: 401 });
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.senha);

      if (!passwordMatch) {
        return res.status(401).json({ success: false, error: 'Credenciais inválidas.', code: 401 });
      }

      const token = generateToken(user);

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.nome,
          email: user.email,
          cargo: user.cargo,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@agrotech.com
 *               password:
 *                 type: string
 *                 example: minhasenha123
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       409:
 *         description: Email já cadastrado
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Nome obrigatório.'),
    body('email').isEmail().withMessage('Email inválido.'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres.'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg, code: 400 });
    }

    const { name, email, password } = req.body;

    try {
      const existing = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ success: false, error: 'Email já cadastrado.', code: 409 });
      }

      const hashed = await bcrypt.hash(password, 10);

      const { rows } = await pool.query(
        'INSERT INTO usuarios (nome, email, senha, cargo) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, cargo',
        [name, email, hashed, 'operador']
      );

      const user = rows[0];
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.nome,
          email: user.email,
          cargo: user.cargo,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autorizado
 */
router.get('/me', require('../middleware/auth'), async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nome, email, cargo, data_criacao FROM usuarios WHERE id = $1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado.', code: 404 });
    }
    const u = rows[0];
    return res.json({
      success: true,
      data: { id: u.id, name: u.nome, email: u.email, cargo: u.cargo, data_criacao: u.data_criacao },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
