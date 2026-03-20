const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Simulação de estado da irrigação (em memória – depois vem do MQTT ou banco)
let irrigationActive = false;

router.post('/acionar', authMiddleware, (req, res) => {
  const { durationMinutes = 30 } = req.body; // opcional: tempo em minutos

  irrigationActive = true;

  // Simula desligar após X minutos (para teste)
  setTimeout(() => {
    irrigationActive = false;
    console.log('Irrigação desligada automaticamente');
  }, durationMinutes * 60 * 1000);

  res.status(200).json({
    success: true,
    message: `Irrigação acionada por ${durationMinutes} minutos`,
    status: 'ativa',
    activatedBy: req.user.email || 'usuário autenticado',
    timestamp: new Date().toISOString()
  });
});

router.get('/status', authMiddleware, (req, res) => {
  res.json({
    active: irrigationActive,
    message: irrigationActive ? 'Irrigação em andamento' : 'Irrigação inativa'
  });
});

module.exports = router;