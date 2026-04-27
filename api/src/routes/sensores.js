const express = require('express');
const pool = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /sensores:
 *   get:
 *     summary: Retorna a leitura mais recente de todos os sensores
 *     tags: [Sensores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sensores com última leitura
 *       401:
 *         description: Não autorizado
 */
router.get('/', async (req, res, next) => {
  if (req.baseUrl && req.baseUrl.includes('historico')) {
    return historicoHandler(req, res, next);
  }
  
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (s.id)
        s.id                  AS sensor_id,
        s.tipo,
        s.unidade,
        d.nome                AS dispositivo,
        d.status              AS dispositivo_status,
        t.nome                AS talhao,
        f.nome                AS fazenda,
        l.valor               AS ultimo_valor,
        l.data_hora           AS ultima_leitura
      FROM sensores s
      LEFT JOIN dispositivo d      ON d.id = s.dispositivo_id
      LEFT JOIN talhao_sensors ts  ON ts.sensor_id = s.id
      LEFT JOIN talhao t           ON t.id = ts.talhao_id
      LEFT JOIN fazenda f          ON f.id = t.fazenda_id
      LEFT JOIN leitura l          ON l.sensor_id = s.id
      ORDER BY s.id, l.data_hora DESC NULLS LAST
    `);

    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /historico:
 *   get:
 *     summary: Retorna histórico de leituras com filtros
 *     tags: [Sensores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sensor_id
 *         schema: { type: integer }
 *         description: Filtrar por sensor específico
 *       - in: query
 *         name: inicio
 *         schema: { type: string, format: date-time }
 *         description: Data/hora de início (ISO 8601)
 *       - in: query
 *         name: fim
 *         schema: { type: string, format: date-time }
 *         description: Data/hora de fim (ISO 8601)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *         description: Número máximo de registros
 *     responses:
 *       200:
 *         description: Histórico de leituras filtrado
 */
async function historicoHandler(req, res, next) {
  try {
    const { sensor_id, inicio, fim, limit = 100 } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (sensor_id) {
      conditions.push(`l.sensor_id = $${idx++}`);
      params.push(Number(sensor_id));
    }
    if (inicio) {
      conditions.push(`l.data_hora >= $${idx++}`);
      params.push(new Date(inicio));
    }
    if (fim) {
      conditions.push(`l.data_hora <= $${idx++}`);
      params.push(new Date(fim));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(Math.min(Number(limit), 1000));

    const { rows } = await pool.query(`
      SELECT
        l.id,
        l.sensor_id,
        s.tipo        AS tipo_sensor,
        s.unidade,
        l.valor,
        l.data_hora
      FROM leitura l
      JOIN sensores s ON s.id = l.sensor_id
      ${where}
      ORDER BY l.data_hora DESC
      LIMIT $${idx}
    `, params);

    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    next(err);
  }
}

// Acessível em GET /api/sensores/historico
router.get('/historico', historicoHandler);

// Acessível em GET /api/sensores/historico
router.get('/historico', historicoHandler);

module.exports = router;
