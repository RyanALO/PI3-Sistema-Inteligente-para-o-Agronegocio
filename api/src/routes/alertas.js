const express = require('express');
const pool = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /alertas:
 *   get:
 *     summary: Listar alertas ativos
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: string
 *           enum: [info, warning, danger]
 *         description: Filtrar por nível de severidade
 *       - in: query
 *         name: talhao_id
 *         schema: { type: integer }
 *         description: Filtrar por talhão
 *     responses:
 *       200:
 *         description: Lista de alertas ativos
 *       401:
 *         description: Não autorizado
 */
router.get('/', async (req, res, next) => {
  try {
    const { nivel, talhao_id } = req.query;

    const conditions = ['a.resolvido = false'];
    const params = [];
    let idx = 1;

    if (nivel) {
      conditions.push(`a.nivel = $${idx++}`);
      params.push(nivel);
    }
    if (talhao_id) {
      conditions.push(`a.talhao_id = $${idx++}`);
      params.push(Number(talhao_id));
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.tipo        AS title,
        a.mensagem    AS message,
        a.nivel       AS severity,
        a.talhao_id,
        t.nome        AS talhao,
        a.data_emitido AS created_at
      FROM alerta a
      LEFT JOIN talhao t ON t.id = a.talhao_id
      ${where}
      ORDER BY
        CASE a.nivel
          WHEN 'danger'  THEN 1
          WHEN 'warning' THEN 2
          WHEN 'info'    THEN 3
          ELSE 4
        END,
        a.data_emitido DESC
    `, params);

    return res.json(rows); // array direto — compatível com mobile
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /alertas/{id}/resolve:
 *   patch:
 *     summary: Marcar alerta como resolvido
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Alerta resolvido
 *       404:
 *         description: Alerta não encontrado
 */
router.patch('/:id/resolve', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE alerta SET resolvido = true WHERE id = $1 AND resolvido = false RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Alerta não encontrado ou já resolvido.', code: 404 });
    }
    return res.json({ success: true, message: 'Alerta resolvido.', data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /alertas:
 *   post:
 *     summary: Criar novo alerta
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [talhao_id, tipo, mensagem, nivel]
 *             properties:
 *               talhao_id: { type: integer }
 *               tipo: { type: string, example: "Umidade Baixa" }
 *               mensagem: { type: string }
 *               nivel:
 *                 type: string
 *                 enum: [info, warning, danger]
 *     responses:
 *       201:
 *         description: Alerta criado
 */
router.post('/', async (req, res, next) => {
  try {
    const { talhao_id, tipo, mensagem, nivel } = req.body;
    if (!talhao_id || !tipo || !mensagem || !nivel) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios: talhao_id, tipo, mensagem, nivel.', code: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO alerta (talhao_id, tipo, mensagem, nivel)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [talhao_id, tipo, mensagem, nivel]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
