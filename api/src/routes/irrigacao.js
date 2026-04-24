const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /irrigacao/acionar:
 *   post:
 *     summary: Acionar irrigação manual em um talhão
 *     tags: [Irrigação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [talhao_id, dispositivo_id]
 *             properties:
 *               talhao_id:
 *                 type: integer
 *                 example: 1
 *               dispositivo_id:
 *                 type: integer
 *                 example: 1
 *               quantidade_agua:
 *                 type: number
 *                 example: 500
 *               duracao_minutos:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       200:
 *         description: Irrigação acionada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post(
  '/acionar',
  [
    body('talhao_id').isInt({ min: 1 }).withMessage('talhao_id inválido.'),
    body('dispositivo_id').isInt({ min: 1 }).withMessage('dispositivo_id inválido.'),
    body('quantidade_agua').optional().isFloat({ min: 0 }),
    body('duracao_minutos').optional().isInt({ min: 1 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg, code: 400 });
    }

    const { talhao_id, dispositivo_id, quantidade_agua = null, duracao_minutos = 60 } = req.body;

    try {
      // Verificar se o talhão existe
      const talhaoCheck = await pool.query('SELECT id FROM talhao WHERE id = $1', [talhao_id]);
      if (talhaoCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Talhão não encontrado.', code: 404 });
      }

      // Verificar se o dispositivo existe e está ativo
      const dispositivoCheck = await pool.query(
        'SELECT id, status FROM dispositivo WHERE id = $1',
        [dispositivo_id]
      );
      if (dispositivoCheck.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Dispositivo não encontrado.', code: 404 });
      }
      if (dispositivoCheck.rows[0].status === 'inativo') {
        return res.status(400).json({ success: false, error: 'Dispositivo está inativo.', code: 400 });
      }

      const inicio = new Date();
      const fim = new Date(inicio.getTime() + duracao_minutos * 60 * 1000);

      const { rows } = await pool.query(
        `INSERT INTO irrigacao (talhao_id, dispositivo_id, inicio, fim, modo, quantidade_agua)
         VALUES ($1, $2, $3, $4, 'manual', $5)
         RETURNING *`,
        [talhao_id, dispositivo_id, inicio, fim, quantidade_agua]
      );

      return res.json({
        success: true,
        message: 'Irrigação acionada com sucesso.',
        data: rows[0],
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /irrigacao:
 *   get:
 *     summary: Listar histórico de irrigações
 *     tags: [Irrigação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: talhao_id
 *         schema: { type: integer }
 *         description: Filtrar por talhão
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Lista de irrigações
 */
router.get('/', async (req, res, next) => {
  try {
    const { talhao_id, limit = 50 } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (talhao_id) {
      conditions.push(`i.talhao_id = $${idx++}`);
      params.push(Number(talhao_id));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(Math.min(Number(limit), 500));

    const { rows } = await pool.query(`
      SELECT
        i.id,
        i.talhao_id,
        t.nome        AS talhao,
        i.dispositivo_id,
        d.nome        AS dispositivo,
        i.inicio,
        i.fim,
        i.modo,
        i.quantidade_agua,
        EXTRACT(EPOCH FROM (i.fim - i.inicio)) / 60 AS duracao_minutos
      FROM irrigacao i
      LEFT JOIN talhao t    ON t.id = i.talhao_id
      LEFT JOIN dispositivo d ON d.id = i.dispositivo_id
      ${where}
      ORDER BY i.inicio DESC
      LIMIT $${idx}
    `, params);

    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /irrigacao/{id}:
 *   get:
 *     summary: Detalhes de uma irrigação
 *     tags: [Irrigação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados da irrigação
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT i.*, t.nome AS talhao, d.nome AS dispositivo
       FROM irrigacao i
       LEFT JOIN talhao t ON t.id = i.talhao_id
       LEFT JOIN dispositivo d ON d.id = i.dispositivo_id
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Irrigação não encontrada.', code: 404 });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
