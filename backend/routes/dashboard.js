const express = require('express');
const { getDb } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/summary — KPIs consolidados
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();

    // Average soil moisture
    const moistureResult = db.exec(`
      SELECT AVG(soil_moisture) as avg_moisture
      FROM sensor_data
      WHERE soil_moisture IS NOT NULL
      AND id IN (SELECT MAX(id) FROM sensor_data WHERE soil_moisture IS NOT NULL GROUP BY device_id)
    `);
    const avgMoisture = moistureResult.length > 0 ? Math.round((moistureResult[0].values[0][0] || 0) * 10) / 10 : 0;

    // Average temperature
    const tempResult = db.exec(`
      SELECT AVG(temperature) as avg_temp
      FROM sensor_data
      WHERE temperature IS NOT NULL
      AND id IN (SELECT MAX(id) FROM sensor_data WHERE temperature IS NOT NULL GROUP BY device_id)
    `);
    const avgTemp = tempResult.length > 0 ? Math.round((tempResult[0].values[0][0] || 0) * 10) / 10 : 0;

    // Active devices count
    const devicesResult = db.exec("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM devices");
    const totalDevices = devicesResult.length > 0 ? devicesResult[0].values[0][0] : 0;
    const activeDevices = devicesResult.length > 0 ? devicesResult[0].values[0][1] : 0;

    // Active alerts count
    const alertsResult = db.exec('SELECT COUNT(*) as count FROM alertas WHERE resolved = 0');
    const activeAlerts = alertsResult.length > 0 ? alertsResult[0].values[0][0] : 0;

    // Recent alerts
    const recentAlertsResult = db.exec('SELECT * FROM alertas WHERE resolved = 0 ORDER BY created_at DESC LIMIT 5');
    let recentAlerts = [];
    if (recentAlertsResult.length > 0) {
      const columns = recentAlertsResult[0].columns;
      recentAlerts = recentAlertsResult[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
      });
    }

    // Temperature history (last 24 data points)
    const historyResult = db.exec(`
      SELECT AVG(temperature) as avg_temp, AVG(humidity) as avg_humidity, AVG(soil_moisture) as avg_moisture,
             strftime('%H:%M', timestamp) as time_label
      FROM sensor_data
      WHERE temperature IS NOT NULL
      GROUP BY strftime('%Y-%m-%d %H', timestamp)
      ORDER BY timestamp DESC
      LIMIT 24
    `);
    let temperatureHistory = [];
    if (historyResult.length > 0) {
      const columns = historyResult[0].columns;
      temperatureHistory = historyResult[0].values.map(row => {
        const obj = {};
        columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
      }).reverse();
    }

    // Productivity simulation (sacas/hectare)
    const productivity = {
      average: 58.4,
      fields: [
        { name: 'T-02 (Destaque)', value: 85 },
        { name: 'T-04', value: 72 },
        { name: 'T-01', value: 65 }
      ]
    };

    // Stock simulation
    const stock = {
      total: '12.5t',
      items: [
        { name: 'Sementes', percentage: 35 },
        { name: 'Fertilizantes', percentage: 40 },
        { name: 'Defensivos', percentage: 25 }
      ]
    };

    res.json({
      kpis: {
        soil_moisture: avgMoisture,
        temperature: avgTemp,
        active_devices: activeDevices,
        total_devices: totalDevices,
        active_alerts: activeAlerts
      },
      recent_alerts: recentAlerts,
      temperature_history: temperatureHistory,
      productivity,
      stock
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
