require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec   = require('./swagger/swagger');
const authMiddleware = require('./middleware/auth');
const errorHandler  = require('./middleware/errorHandler');

// Routes
const authRoutes      = require('./routes/auth');
const sensoresRoutes  = require('./routes/sensores');
const irrigacaoRoutes = require('./routes/irrigacao');
const alertasRoutes   = require('./routes/alertas');
const dashboardRoutes = require('./routes/dashboard');
const dadosRoutes     = require('./routes/dados');
const fazendaRoutes   = require('./routes/fazenda');
const estoqueRoutes   = require('./routes/estoque');
const configRoutes    = require('./routes/configuracoes');

const app = express();

// ─── Middlewares Globais ──────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'AgroTech API Docs',
  customCss: `
    .swagger-ui .topbar { background-color: #16a34a; }
    .swagger-ui .topbar .link { display: none; }
    .swagger-ui .info .title { color: #16a34a; }
  `,
}));

// JSON raw da spec para integração com ferramentas externas
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'AgroTech API',
  });
});

// ─── Rotas Públicas ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Rotas Protegidas (JWT obrigatório) ───────────────────────────────────────
app.use('/api/sensores',   authMiddleware, sensoresRoutes);
app.use('/api/historico',  authMiddleware, sensoresRoutes);
app.use('/api/irrigacao',  authMiddleware, irrigacaoRoutes);
app.use('/api/alertas',    authMiddleware, alertasRoutes);
app.use('/api/dashboard',  authMiddleware, dashboardRoutes);
app.use('/api/dados',      authMiddleware, dadosRoutes);
app.use('/api/fazenda',    authMiddleware, fazendaRoutes);
app.use('/api/estoque',    authMiddleware, estoqueRoutes);
app.use('/api/configuracoes', authMiddleware, configRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Rota não encontrada: ${req.method} ${req.path}`,
    code: 404,
  });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

async function startServer() {
  // Aguarda banco de dados ficar disponível (retry com backoff)
  const pool = require('./config/database');
  let retries = 10;

  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Banco de dados conectado.');
      break;
    } catch (err) {
      retries--;
      console.log(`⏳ Aguardando banco de dados... (${retries} tentativas restantes)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  if (retries === 0) {
    console.error('❌ Não foi possível conectar ao banco de dados. Encerrando.');
    process.exit(1);
  }

  // --- Bootstrap do Sistema Inteligente ---
  const brain = require('./services/brain');
  const simulator = require('./services/simulator');
  await brain.init();
  simulator.start(); // Inicia as leituras IoT a cada 15 segundos

  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🌱 ============================================');
    console.log(`   AgroTech API v1.0.0 rodando na porta ${PORT}`);
    console.log(`   📖 Swagger: http://localhost:${PORT}/api/docs`);
    console.log(`   ❤️  Health:  http://localhost:${PORT}/api/health`);
    console.log('🌱 ============================================');
    console.log('');
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
