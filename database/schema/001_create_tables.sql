-- Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    senha TEXT,
    cargo VARCHAR(20),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipes
CREATE TABLE equipes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    lider_id INT REFERENCES usuarios(id)
);

CREATE TABLE usuario_equipe (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    equipe_id INT REFERENCES equipes(id),
    cargo_time VARCHAR(20)
);

-- Fazenda
CREATE TABLE fazenda (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    localizacao TEXT
);

-- Talhao
CREATE TABLE talhao (
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
CREATE TABLE dispositivo (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    nome VARCHAR(100),
    status VARCHAR(20),
    modo VARCHAR(20)
);

-- Sensores
CREATE TABLE sensores (
    id SERIAL PRIMARY KEY,
    dispositivo_id INT REFERENCES dispositivo(id),
    tipo VARCHAR(50),
    unidade VARCHAR(20)
);

-- Relacionamento Talhao_Sensor
CREATE TABLE talhao_sensors (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    sensor_id INT REFERENCES sensores(id)
);

-- Leituras
CREATE TABLE leitura (
    id SERIAL PRIMARY KEY,
    sensor_id INT REFERENCES sensores(id),
    valor FLOAT,
    data_hora TIMESTAMP
);

-- Clima
CREATE TABLE clima (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    temperatura FLOAT,
    umidade FLOAT,
    chuva FLOAT,
    data_hora TIMESTAMP
);

-- Irrigacao
CREATE TABLE irrigacao (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    dispositivo_id INT REFERENCES dispositivo(id),
    inicio TIMESTAMP,
    fim TIMESTAMP,
    modo VARCHAR(20),
    quantidade_agua FLOAT
);

-- Alertas
CREATE TABLE alerta (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    tipo VARCHAR(50),
    mensagem TEXT,
    nivel VARCHAR(20),
    data_emitido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produtividade
CREATE TABLE rendimento (
    id SERIAL PRIMARY KEY,
    talhao_id INT REFERENCES talhao(id),
    producao_total FLOAT,
    area_utilizada FLOAT,
    produtividade FLOAT,
    data_colheita DATE
);

-- Estoque
CREATE TABLE estoque (
    id SERIAL PRIMARY KEY,
    fazenda_id INT REFERENCES fazenda(id),
    nome_produto VARCHAR(100),
    tipo VARCHAR(50),
    quantidade FLOAT,
    custo_unitario FLOAT,
    data_validade DATE,
    fornecedor VARCHAR(100)
);

-- Índices para busca rapida

-- Leituras (IoT)
CREATE INDEX idx_leitura_sensor_data 
ON leitura(sensor_id, data_hora DESC);

-- Clima por talhão
CREATE INDEX idx_clima_talhao_data 
ON clima(talhao_id, data_hora DESC);

-- Alertas por talhão
CREATE INDEX idx_alerta_talhao 
ON alerta(talhao_id);

-- Irrigação por talhão
CREATE INDEX idx_irrigacao_talhao 
ON irrigacao(talhao_id);

-- Sensores por dispositivo
CREATE INDEX idx_sensor_dispositivo 
ON sensores(dispositivo_id);

-- Talhões por fazenda
CREATE INDEX idx_talhao_fazenda 
ON talhao(fazenda_id);

-- Usuários por equipe
CREATE INDEX idx_usuario_equipe 
ON usuario_equipe(equipe_id);

-- Estoque por fazenda
CREATE INDEX idx_estoque_fazenda 
ON estoque(fazenda_id);