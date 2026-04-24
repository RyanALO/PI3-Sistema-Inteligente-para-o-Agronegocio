-- ============================================================
-- AgroTech — Script de inicialização do banco de dados
-- ============================================================

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    senha TEXT,
    cargo VARCHAR(20),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipes
CREATE TABLE IF NOT EXISTS equipes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    lider_id INT REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS usuario_equipe (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    equipe_id INT REFERENCES equipes(id),
    cargo_time VARCHAR(20)
);

-- Fazenda
CREATE TABLE IF NOT EXISTS fazenda (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    localizacao TEXT
);

-- Talhao
CREATE TABLE IF NOT EXISTS talhao (
    id SERIAL PRIMARY KEY,
    fazenda_id INT REFERENCES fazenda(id),
    nome VARCHAR(100),
    cultura VARCHAR(100),
    area FLOAT,
    data_plantio DATE,
    data_colheita DATE,
    status VARCHAR(20),
    latitude FLOAT,
    longitude FLOAT
);

-- Dispositivos
CREATE TABLE IF NOT EXISTS dispositivo (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    nome VARCHAR(100),
    status VARCHAR(20),
    modo VARCHAR(20)
);

-- Sensores
CREATE TABLE IF NOT EXISTS sensores (
    id SERIAL PRIMARY KEY,
    dispositivo_id INT REFERENCES dispositivo(id),
    tipo VARCHAR(50),
    unidade VARCHAR(20)
);

-- Relacionamento Talhao_Sensor
CREATE TABLE IF NOT EXISTS talhao_sensors (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    sensor_id INT REFERENCES sensores(id)
);

-- Leituras
CREATE TABLE IF NOT EXISTS leitura (
    id SERIAL PRIMARY KEY,
    sensor_id INT REFERENCES sensores(id),
    valor FLOAT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clima
CREATE TABLE IF NOT EXISTS clima (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    temperatura FLOAT,
    umidade FLOAT,
    chuva FLOAT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Irrigacao
CREATE TABLE IF NOT EXISTS irrigacao (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    dispositivo_id INT REFERENCES dispositivo(id),
    inicio TIMESTAMP,
    fim TIMESTAMP,
    modo VARCHAR(20),
    quantidade_agua FLOAT
);

-- Alertas (campo resolvido adicionado para suporte ao endpoint PATCH /alertas/:id/resolve)
CREATE TABLE IF NOT EXISTS alerta (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    tipo VARCHAR(50),
    mensagem TEXT,
    nivel VARCHAR(20),
    resolvido BOOLEAN DEFAULT false,
    data_emitido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produtividade
CREATE TABLE IF NOT EXISTS rendimento (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    producao_total FLOAT,
    area_utilizada FLOAT,
    produtividade FLOAT,
    data_colheita DATE
);

-- Estoque
CREATE TABLE IF NOT EXISTS estoque (
    id SERIAL PRIMARY KEY,
    fazenda_id INT REFERENCES fazenda(id),
    nome_produto VARCHAR(100),
    tipo VARCHAR(50),
    quantidade FLOAT,
    custo_unitario FLOAT,
    data_validade DATE,
    fornecedor VARCHAR(100)
);

-- ============================================================
-- Índices para busca rápida
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_leitura_sensor_data ON leitura(sensor_id, data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_clima_talhao_data ON clima(talhao_id, data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_alerta_talhao ON alerta(talhao_id);
CREATE INDEX IF NOT EXISTS idx_irrigacao_talhao ON irrigacao(talhao_id);
CREATE INDEX IF NOT EXISTS idx_sensor_dispositivo ON sensores(dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_talhao_fazenda ON talhao(fazenda_id);
CREATE INDEX IF NOT EXISTS idx_usuario_equipe ON usuario_equipe(equipe_id);
CREATE INDEX IF NOT EXISTS idx_estoque_fazenda ON estoque(fazenda_id);

-- ============================================================
-- Dados de seed para demonstração
-- ============================================================

-- Usuário administrador (senha: admin123)
INSERT INTO usuarios (nome, email, senha, cargo) VALUES
  ('Administrador AgroTech', 'admin@agrotech.com', '$2a$10$BqBp65ZoaYJFDOb.i6hMdeWO0/wdOlpPmBIqAQ/oPaf035bB7spS2', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Usuário de teste (senha: 123456)
INSERT INTO usuarios (nome, email, senha, cargo) VALUES
  ('Gustavinho', 'gustavinho@agrotech.com', '$2a$10$7SgGdbfEGosUx7Eh0a2FgOnfNZSOZyz.TOuQwrxEutzeCtO3dCtdO', 'operador')
ON CONFLICT (email) DO NOTHING;

-- Fazenda
INSERT INTO fazenda (nome, localizacao) VALUES
  ('Fazenda Santa Clara', 'Goiás, Brasil'),
  ('Fazenda São João', 'Mato Grosso, Brasil')
ON CONFLICT DO NOTHING;

-- Talhões
INSERT INTO talhao (fazenda_id, nome, cultura, area, data_plantio, data_colheita, status, latitude, longitude) VALUES
  (1, 'Talhão Norte A1', 'Soja', 450.0, '2024-10-01', '2025-02-28', 'ativo', -15.7801, -47.9292),
  (1, 'Talhão Leste B2', 'Milho', 320.0, '2024-11-01', '2025-03-31', 'ativo', -15.7900, -47.9400),
  (2, 'Talhão Sul C3', 'Soja', 280.0, '2024-10-15', '2025-03-15', 'colhido', -15.8100, -47.9600)
ON CONFLICT DO NOTHING;

-- Dispositivos
INSERT INTO dispositivo (usuario_id, nome, status, modo) VALUES
  (1, 'Controlador IoT #1', 'ativo', 'automatico'),
  (1, 'Controlador IoT #2', 'ativo', 'manual'),
  (1, 'Controlador IoT #3', 'inativo', 'automatico')
ON CONFLICT DO NOTHING;

-- Sensores
INSERT INTO sensores (dispositivo_id, tipo, unidade) VALUES
  (1, 'umidade_solo', '%'),
  (1, 'temperatura', '°C'),
  (2, 'umidade_solo', '%'),
  (2, 'temperatura', '°C'),
  (2, 'chuva', 'mm'),
  (3, 'umidade_solo', '%')
ON CONFLICT DO NOTHING;

-- Vínculo talhão-sensor
INSERT INTO talhao_sensors (talhao_id, sensor_id) VALUES
  (1, 1), (1, 2),
  (2, 3), (2, 4), (2, 5),
  (3, 6)
ON CONFLICT DO NOTHING;

-- Leituras dos últimos dias
INSERT INTO leitura (sensor_id, valor, data_hora) VALUES
  (1, 62.5, NOW() - INTERVAL '1 hour'),
  (1, 60.1, NOW() - INTERVAL '3 hours'),
  (1, 58.3, NOW() - INTERVAL '6 hours'),
  (2, 28.4, NOW() - INTERVAL '1 hour'),
  (2, 27.9, NOW() - INTERVAL '3 hours'),
  (2, 26.1, NOW() - INTERVAL '6 hours'),
  (3, 45.2, NOW() - INTERVAL '1 hour'),
  (3, 44.8, NOW() - INTERVAL '2 hours'),
  (4, 31.0, NOW() - INTERVAL '1 hour'),
  (4, 30.2, NOW() - INTERVAL '2 hours'),
  (5, 0.0,  NOW() - INTERVAL '1 hour'),
  (6, 38.9, NOW() - INTERVAL '1 hour');

-- Dados climáticos
INSERT INTO clima (talhao_id, temperatura, umidade, chuva, data_hora) VALUES
  (1, 28.4, 62.5, 0.0,  NOW() - INTERVAL '1 hour'),
  (1, 27.9, 64.0, 0.0,  NOW() - INTERVAL '3 hours'),
  (1, 26.1, 68.2, 2.1,  NOW() - INTERVAL '6 hours'),
  (1, 25.3, 72.5, 5.3,  NOW() - INTERVAL '12 hours'),
  (1, 24.1, 75.1, 0.0,  NOW() - INTERVAL '18 hours'),
  (1, 23.8, 70.0, 0.0,  NOW() - INTERVAL '24 hours'),
  (2, 31.0, 45.2, 0.0,  NOW() - INTERVAL '1 hour'),
  (2, 30.2, 47.0, 0.0,  NOW() - INTERVAL '3 hours');

-- Alertas
INSERT INTO alerta (talhao_id, tipo, mensagem, nivel, resolvido) VALUES
  (1, 'Umidade Baixa', 'Umidade do solo abaixo de 40% no Talhão Norte A1. Irrigação recomendada.', 'warning', false),
  (2, 'Temperatura Alta', 'Temperatura acima de 35°C detectada no Talhão Leste B2. Risco de estresse hídrico.', 'danger', false),
  (1, 'Sensor Offline', 'Sensor de chuva #5 sem resposta há mais de 2 horas.', 'info', false)
ON CONFLICT DO NOTHING;

-- Irrigações anteriores
INSERT INTO irrigacao (talhao_id, dispositivo_id, inicio, fim, modo, quantidade_agua) VALUES
  (1, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 hours', 'automatico', 1500.0),
  (2, 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '1 hour 30 minutes', 'manual', 800.0);

-- Rendimento
INSERT INTO rendimento (talhao_id, producao_total, area_utilizada, produtividade, data_colheita) VALUES
  (3, 1680.0, 280.0, 60.0, '2025-03-15');

-- Estoque
INSERT INTO estoque (fazenda_id, nome_produto, tipo, quantidade, custo_unitario, data_validade, fornecedor) VALUES
  (1, 'Fertilizante NPK 10-10-10', 'fertilizante', 5000.0, 3.50, '2025-12-31', 'AgroSupri'),
  (1, 'Herbicida Roundup', 'defensivo', 800.0, 45.00, '2025-06-30', 'Monsanto'),
  (1, 'Fungicida Opera', 'defensivo', 300.0, 120.00, '2025-09-30', 'BASF'),
  (2, 'Semente Soja RR', 'semente', 2000.0, 8.00, '2025-07-01', 'Sementes ABC')
ON CONFLICT DO NOTHING;
