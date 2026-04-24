const express = require('express');
const pool = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Retorna resumo de KPIs, clima, produtividade e estoque para o dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do dashboard
 *       401:
 *         description: Não autorizado
 */
router.get('/summary', async (req, res, next) => {
  try {
    // KPIs: última umidade do solo e temperatura
    const kpisQuery = await pool.query(`
      SELECT
        AVG(CASE WHEN s.tipo = 'umidade_solo' THEN l.valor END) AS soil_moisture,
        AVG(CASE WHEN s.tipo = 'temperatura'  THEN l.valor END) AS temperature
      FROM leitura l
      JOIN sensores s ON s.id = l.sensor_id
      WHERE l.data_hora >= NOW() - INTERVAL '6 hours'
    `);

    // Histórico de temperatura para o gráfico (últimas 8 horas)
    const tempHistoryQuery = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('hour', c.data_hora), 'HH24h') AS time_label,
        ROUND(AVG(c.temperatura)::numeric, 1)              AS avg_temp
      FROM clima c
      WHERE c.data_hora >= NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', c.data_hora)
      ORDER BY DATE_TRUNC('hour', c.data_hora) ASC
      LIMIT 8
    `);

    // Produtividade por talhão
    const productivityQuery = await pool.query(`
      SELECT
        t.nome                                                    AS name,
        ROUND(
          (r.produtividade / NULLIF(MAX(r.produtividade) OVER (), 0) * 100)::numeric,
          1
        )                                                          AS value
      FROM rendimento r
      JOIN talhao t ON t.id = r.talhao_id
      ORDER BY r.produtividade DESC
      LIMIT 5
    `);

    const avgProductivity = productivityQuery.rows.length > 0
      ? Math.round(productivityQuery.rows.reduce((sum, r) => sum + parseFloat(r.value || 0), 0) / productivityQuery.rows.length)
      : 0;

    // Estoque: total e distribuição por tipo
    const stockQuery = await pool.query(`
      SELECT
        tipo                         AS name,
        SUM(quantidade)              AS total_qty,
        ROUND(
          (SUM(quantidade) / NULLIF(SUM(SUM(quantidade)) OVER (), 0) * 100)::numeric,
          1
        )                            AS percentage
      FROM estoque
      GROUP BY tipo
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    const totalStock = stockQuery.rows.reduce((sum, r) => sum + parseFloat(r.total_qty || 0), 0);

    const kpis = kpisQuery.rows[0];

    return res.json({
      success: true,
      data: {
        kpis: {
          soil_moisture: Math.round(parseFloat(kpis.soil_moisture) || 0),
          temperature: parseFloat(parseFloat(kpis.temperature || 0).toFixed(1)),
        },
        temperature_history: tempHistoryQuery.rows.map(r => ({
          time_label: r.time_label,
          avg_temp: parseFloat(r.avg_temp),
        })),
        productivity: {
          average: avgProductivity,
          fields: productivityQuery.rows.map(r => ({
            name: r.name,
            value: parseFloat(r.value),
          })),
        },
        stock: {
          total: `${(totalStock / 1000).toFixed(1)}t`,
          items: stockQuery.rows.map(r => ({
            name: r.name,
            percentage: parseFloat(r.percentage),
          })),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
