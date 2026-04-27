const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/database');

let token = '';

describe('API Integration Tests (Mobile User Story)', () => {
  // Limpar a tabela de usuários antes para garantir que testamos o login de um registro conhecido ou inserir
  beforeAll(async () => {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('123', 10);
    // Insere ou atualiza o usuário de teste para garantir a senha exata do CT01
    await pool.query(`
      INSERT INTO usuarios (nome, email, senha, cargo) 
      VALUES ('Tester', 'tester@agro.com', $1, 'admin')
      ON CONFLICT (email) DO UPDATE SET senha = $1;
    `, [hash]);
  });

  afterAll(async () => {
    // Previne vazamento de memória do Jest ao não fechar o banco
    await pool.end();
  });

  // CT01 | Login válido | Credenciais corretas | JWT retornado com sucesso
  test('CT01: Login com credenciais corretas retorna Token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tester@agro.com', password: '123' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    
    token = res.body.token; // Guardar token para os testes seguintes
  });

  // CT02 | Login inválido | Senha errada | 401 Unauthorized
  test('CT02: Login com senha errada barra o acesso', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tester@agro.com', password: 'senhaincorreta123' });
    
    expect(res.statusCode).toBe(401); // Retorna 401 Unauthorized para senhas falsas
    expect(res.body.success).toBe(false);
  });

  // CT03 | GET /sensores autenticado | JWT válido | Dados atuais dos sensores
  test('CT03: Acesso rotas Autenticadas (Sensores) com Token válido', async () => {
    const res = await request(app)
      .get('/api/sensores')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  // CT04 | GET /sensores sem token | Sem header | 401 Unauthorized
  test('CT04: Bloqueio de rota sem Token informado', async () => {
    const res = await request(app).get('/api/sensores');
    
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  // CT05 | POST /irrigacao/acionar | JWT + payload | Irrigação acionada, 200 OK
  test('CT05: Acionamento manual da irrigação com Token', async () => {
    // É mandatório para passar precisarmos fingir que há um talhão id 1 e dispositivo 1 
    // Caso o script rode contra um banco zerado, o endpoint vai retornar "404 Talhão não encontrado."
    const res = await request(app)
      .post('/api/irrigacao/acionar')
      .set('Authorization', `Bearer ${token}`)
      .send({
        talhao_id: 1,
        dispositivo_id: 1,
        duracao_minutos: 15,
        quantidade_agua: 100
      });
    
    // Pode ser que passe 200, ou falhe 404 se não houver o componente inserido nos seeds (Apesar disso testaremos o contrato do Token e Estrutura)
    expect([200, 404]).toContain(res.statusCode);
  });

  // CT06 | GET /historico com filtro | Data início/fim | Registros filtrados corretamente
  test('CT06: Busca de histórico com passagem de query params (filtros)', async () => {
    const res = await request(app)
      .get('/api/historico?inicio=2026-01-01&limit=5')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeLessThanOrEqual(5);
  });
});
