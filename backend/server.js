require('dotenv').config();
const express = require('express');
const cors = require('cors');
const net = require('net');
const path = require('path');
const { getDb } = require('./db');
const { setupMqttHandler } = require('./mqtt/handler');

const app = express();
const PORT = process.env.PORT || 3000;
const MQTT_PORT = process.env.MQTT_PORT || 1883;

// Middleware
app.use(cors());
app.use(express.json());

// Serve web build (static files)
app.use(express.static(path.join(__dirname, '..', 'web', 'dist')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dados', require('./routes/dados'));
app.use('/api/alertas', require('./routes/alertas'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      mqtt: 'running',
      database: 'connected'
    }
  });
});

// SPA fallback (for React Router)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'web', 'dist', 'index.html'));
  }
});

// Initialize
async function start() {
  // Initialize database
  await getDb();
  console.log('💾 Database connected (SQLite)');

  // Start MQTT broker
  const aedes = require('aedes')();
  const mqttServer = net.createServer(aedes.handle);

  mqttServer.listen(MQTT_PORT, () => {
    console.log(`📡 MQTT Broker running on port ${MQTT_PORT}`);
  });

  // Setup MQTT message handler
  setupMqttHandler(aedes);

  // Start HTTP server  
  app.listen(PORT, () => {
    console.log(`\n🚀 AgroTech Backend running!`);
    console.log(`   API:  http://localhost:${PORT}`);
    console.log(`   MQTT: mqtt://localhost:${MQTT_PORT}`);
    console.log(`   Web:  http://localhost:${PORT} (serve build estático)\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
