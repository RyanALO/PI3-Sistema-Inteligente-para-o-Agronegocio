const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const authRoutes = require('./routes/auth');
const sensorRoutes = require('./routes/sensors');
const irrigationRoutes = require('./routes/irrigation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Carrega Swagger
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger/swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/sensores', sensorRoutes);
app.use('/api/irrigacao', irrigationRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API AgriBusiness rodando! Docs: http://localhost:3000/api-docs' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});