const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('../db');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agrotech_secret_key_2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const db = await getDb();

    // Check if user exists
    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    saveDb();

    const result = db.exec('SELECT id, name, email, role, farm_name, created_at FROM users WHERE email = ?', [email]);
    const user = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      email: result[0].values[0][2],
      role: result[0].values[0][3],
      farm_name: result[0].values[0][4],
      created_at: result[0].values[0][5]
    };

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const db = await getDb();

    const result = db.exec('SELECT id, name, email, password, role, farm_name FROM users WHERE email = ?', [email]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const row = result[0].values[0];
    const user = {
      id: row[0],
      name: row[1],
      email: row[2],
      password: row[3],
      role: row[4],
      farm_name: row[5]
    };

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    delete user.password;
    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec('SELECT id, name, email, role, farm_name, created_at FROM users WHERE id = ?', [req.userId]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const row = result[0].values[0];
    res.json({
      id: row[0],
      name: row[1],
      email: row[2],
      role: row[3],
      farm_name: row[4],
      created_at: row[5]
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
