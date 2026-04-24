const express = require('express');
const pool = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /fazenda:
 *   get:
 *     summary: Listar fazendas
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de fazendas
 */
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        f.id,
        f.nome,
        f.localizacao,
        COUNT(t.id) AS total_talhoes
      FROM fazenda f
      LEFT JOIN talhao t ON t.fazenda_id = f.id
      GROUP BY f.id
      ORDER BY f.nome
    `);
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /fazenda/{id}:
 *   get:
 *     summary: Detalhes de uma fazenda
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Dados da fazenda
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM fazenda WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Fazenda não encontrada.', code: 404 });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /fazenda:
 *   post:
 *     summary: Criar nova fazenda
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *               localizacao: { type: string }
 *     responses:
 *       201:
 *         description: Fazenda criada
 */
router.post('/', async (req, res, next) => {
  try {
    const { nome, localizacao } = req.body;
    if (!nome) {
      return res.status(400).json({ success: false, error: 'Nome da fazenda obrigatório.', code: 400 });
    }
    const { rows } = await pool.query(
      'INSERT INTO fazenda (nome, localizacao) VALUES ($1, $2) RETURNING *',
      [nome, localizacao || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /fazenda/{id}/talhoes:
 *   get:
 *     summary: Listar talhões de uma fazenda
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de talhões
 */
router.get('/:id/talhoes', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        t.*,
        COUNT(DISTINCT ts.sensor_id) AS total_sensores,
        COUNT(DISTINCT a.id) FILTER (WHERE a.resolvido = false) AS alertas_ativos
      FROM talhao t
      LEFT JOIN talhao_sensors ts ON ts.talhao_id = t.id
      LEFT JOIN alerta a          ON a.talhao_id = t.id
      WHERE t.fazenda_id = $1
      GROUP BY t.id
      ORDER BY t.nome
    `, [req.params.id]);
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /fazenda/{id}/talhoes:
 *   post:
 *     summary: Criar talhão em uma fazenda
 *     tags: [Fazenda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome: { type: string }
 *               cultura: { type: string }
 *               area: { type: number }
 *               status: { type: string }
 *               data_plantio: { type: string, format: date }
 *               data_colheita: { type: string, format: date }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *     responses:
 *       201:
 *         description: Talhão criado
 */
router.post('/:id/talhoes', async (req, res, next) => {
  try {
    const { nome, cultura, area, status, data_plantio, data_colheita, latitude, longitude } = req.body;
    if (!nome) {
      return res.status(400).json({ success: false, error: 'Nome do talhão obrigatório.', code: 400 });
    }
    const { rows } = await pool.query(
      `INSERT INTO talhao (fazenda_id, nome, cultura, area, data_plantio, data_colheita, status, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.params.id, nome, cultura || null, area || null, data_plantio || null, data_colheita || null, status || 'ativo', latitude || null, longitude || null]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
