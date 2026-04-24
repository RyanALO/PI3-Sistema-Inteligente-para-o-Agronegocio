const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgroTech API',
      version: '1.0.0',
      description: `
# API REST — Sistema Inteligente para o Agronegócio

API completa para gestão de irrigação, sensores IoT, alertas e dados de produtividade agrícola.

## Autenticação
Todos os endpoints (exceto \`/auth/login\` e \`/auth/register\`) requerem um token JWT.

Envie o token no header:
\`\`\`
Authorization: Bearer <seu_token>
\`\`\`

## Credenciais de Teste
| Email | Senha | Cargo |
|---|---|---|
| admin@agrotech.com | admin123 | admin |
| gustavinho@agrotech.com | 123456 | operador |
      `,
      contact: {
        name: 'AgroTech Team',
        email: 'suporte@agrotech.com',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            code: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Autenticação e gerenciamento de sessão' },
      { name: 'Sensores', description: 'Leitura de sensores IoT e histórico' },
      { name: 'Irrigação', description: 'Controle e histórico de irrigação' },
      { name: 'Alertas', description: 'Alertas ativos do sistema' },
      { name: 'Dashboard', description: 'KPIs e resumo para o painel' },
      { name: 'Dados IoT', description: 'Dados brutos de sensores e clima' },
      { name: 'Fazenda', description: 'Gerenciamento de fazendas e talhões' },
      { name: 'Estoque', description: 'Gestão de insumos e estoque' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
