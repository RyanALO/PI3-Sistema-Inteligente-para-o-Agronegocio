const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Dados simulados
const sensors = {
  umidadeSolo: 62,
  temperatura: 24,
  nitrogenio: 48,
  ph: 6.8,
  solar: 840,
  status: 'healthy'
};

router.get('/', authMiddleware, (req, res) => {
  res.json({
    data: sensors,
    lastUpdate: new Date().toISOString(),
    message: 'Dados atuais dos sensores'
  });
});

module.exports = router;