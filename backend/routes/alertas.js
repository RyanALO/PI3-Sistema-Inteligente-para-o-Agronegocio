const express = require('express');
const { getDb, saveDb } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/alertas — listar alertas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { resolved = '0' } = req.query;
    const db = await getDb();

    const result = db.exec(
      'SELECT * FROM alertas WHERE resolved = ? ORDER BY created_at DESC',
      [parseInt(resolved)]
    );

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
    console.error('Alertas GET error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/alertas — criar alerta manual
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, severity, title, message, device_id } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Tipo, título e mensagem são obrigatórios' });
    }

    const db = await getDb();
    db.run(
      'INSERT INTO alertas (type, severity, title, message, device_id) VALUES (?, ?, ?, ?, ?)',
      [type, severity || 'warning', title, message, device_id || null]
    );
    saveDb();

    res.status(201).json({ message: 'Alerta criado com sucesso' });
  } catch (err) {
    console.error('Alertas POST error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PATCH /api/alertas/:id/resolve — resolver alerta
router.patch('/:id/resolve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    db.run('UPDATE alertas SET resolved = 1 WHERE id = ?', [parseInt(id)]);
    saveDb();

    res.json({ message: 'Alerta resolvido' });
  } catch (err) {
    console.error('Alertas PATCH error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
