const express = require('express');
const { getDb, saveDb } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/dados — inserir dados de sensor
router.post('/', async (req, res) => {
  try {
    const { device_id, temperature, humidity, soil_moisture, pressure } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: 'device_id é obrigatório' });
    }

    const db = await getDb();
    db.run(
      'INSERT INTO sensor_data (device_id, temperature, humidity, soil_moisture, pressure) VALUES (?, ?, ?, ?, ?)',
      [device_id, temperature || null, humidity || null, soil_moisture || null, pressure || null]
    );
    saveDb();

    // Check for alert conditions
    if (temperature && temperature > 40) {
      db.run(
        'INSERT INTO alertas (type, severity, title, message, device_id) VALUES (?, ?, ?, ?, ?)',
        ['temperature', 'danger', 'Temperatura Crítica', `Temperatura de ${temperature}°C detectada no sensor ${device_id}`, device_id]
      );
    }
    if (soil_moisture && soil_moisture < 20) {
      db.run(
        'INSERT INTO alertas (type, severity, title, message, device_id) VALUES (?, ?, ?, ?, ?)',
        ['moisture', 'warning', 'Umidade do Solo Baixa', `Umidade do solo em ${soil_moisture}% no sensor ${device_id}. Considere irrigação.`, device_id]
      );
    }

    saveDb();
    res.status(201).json({ message: 'Dados registrados com sucesso' });
  } catch (err) {
    console.error('Dados POST error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dados — listar dados com filtros
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { device_id, limit = 100, offset = 0 } = req.query;
    const db = await getDb();

    let query = 'SELECT * FROM sensor_data';
    const params = [];

    if (device_id) {
      query += ' WHERE device_id = ?';
      params.push(device_id);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const result = db.exec(query, params);

    if (result.length === 0) {
      return res.json([]);
    }

    const columns = result[0].columns;
    const rows = result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });

    res.json(rows);
  } catch (err) {
    console.error('Dados GET error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dados/latest — últimos dados por dispositivo
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();

    const result = db.exec(`
      SELECT sd.*, d.name as device_name, d.type as device_type, d.location as device_location
      FROM sensor_data sd
      JOIN devices d ON sd.device_id = d.id
      WHERE sd.id IN (
        SELECT MAX(id) FROM sensor_data GROUP BY device_id
      )
      ORDER BY sd.timestamp DESC
    `);

    if (result.length === 0) {
      return res.json([]);
    }

    const columns = result[0].columns;
    const rows = result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });

    res.json(rows);
  } catch (err) {
    console.error('Dados latest error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
