const express = require('express');
const pool = require('../config/database');
const brain = require('../services/brain');

const router = express.Router();

/**
 * @swagger
 * /configuracoes:
 *   get:
 *     summary: Retorna as configurações globais do sistema e inteligência
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configurações carregadas
 */
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM configuracoes WHERE id = 1');
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /configuracoes:
 *   put:
 *     summary: Atualiza as configurações globais
 *     tags: [Configurações]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               irrigacao_automatica: { type: boolean }
 *               umidade_minima: { type: number }
 *               umidade_maxima: { type: number }
 *     responses:
 *       200:
 *         description: Configurações atualizadas
 */
router.put('/', async (req, res, next) => {
  try {
    const { irrigacao_automatica, umidade_minima, umidade_maxima } = req.body;

    const { rows } = await pool.query(
      `UPDATE configuracoes 
       SET irrigacao_automatica = $1, umidade_minima = $2, umidade_maxima = $3 
       WHERE id = 1 RETURNING *`,
      [irrigacao_automatica, umidade_minima, umidade_maxima]
    );

    return res.json({ success: true, message: 'Configurações do AgroTech atualizadas', data: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
