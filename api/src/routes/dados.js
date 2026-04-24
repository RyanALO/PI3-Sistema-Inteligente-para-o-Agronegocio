const express = require('express');
const pool = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /dados/latest:
 *   get:
 *     summary: Retorna as últimas leituras de cada sensor com metadados completos
 *     tags: [Dados IoT]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Últimas leituras dos sensores
 */
router.get('/latest', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (s.id)
        s.id            AS sensor_id,
        s.tipo,
        s.unidade,
        d.nome          AS dispositivo,
        d.status        AS dispositivo_status,
        d.modo          AS dispositivo_modo,
        t.nome          AS talhao,
        t.cultura,
        f.nome          AS fazenda,
        l.valor,
        l.data_hora,
        CASE
          WHEN l.data_hora IS NULL THEN 'offline'
          WHEN l.data_hora < NOW() - INTERVAL '1 hour' THEN 'stale'
          ELSE 'online'
        END AS status_leitura
      FROM sensores s
      JOIN dispositivo d       ON d.id = s.dispositivo_id
      LEFT JOIN talhao_sensors ts ON ts.sensor_id = s.id
      LEFT JOIN talhao t       ON t.id = ts.talhao_id
      LEFT JOIN fazenda f      ON f.id = t.fazenda_id
      LEFT JOIN leitura l      ON l.sensor_id = s.id
      ORDER BY s.id, l.data_hora DESC NULLS LAST
    `);

    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /dados/clima:
 *   get:
 *     summary: Últimos dados climáticos por talhão
 *     tags: [Dados IoT]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: talhao_id
 *         schema: { type: integer }
 *       - in: query
 *         name: horas
 *         schema: { type: integer, default: 24 }
 *     responses:
 *       200:
 *         description: Dados climáticos
 */
router.get('/clima', async (req, res, next) => {
  try {
    const { talhao_id, horas = 24 } = req.query;

    const conditions = [`c.data_hora >= NOW() - INTERVAL '${Math.min(Number(horas), 168)} hours'`];
    const params = [];
    let idx = 1;

    if (talhao_id) {
      conditions.push(`c.talhao_id = $${idx++}`);
      params.push(Number(talhao_id));
    }

    const { rows } = await pool.query(`
      SELECT
        c.id,
        c.talhao_id,
        t.nome       AS talhao,
        c.temperatura,
        c.umidade,
        c.chuva,
        c.data_hora
      FROM clima c
      LEFT JOIN talhao t ON t.id = c.talhao_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.data_hora DESC
      LIMIT 200
    `, params);

    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
