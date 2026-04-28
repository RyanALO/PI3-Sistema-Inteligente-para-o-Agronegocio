# Guia do Banco de Dados — Sistema de Irrigação

## Visão Geral

Este guia ensina como:

* Subir o banco com Docker
* Acessar o pgAdmin
* Executar o script SQL
* Inserir dados de teste
* Validar consultas reais

---

# 1. Subindo o Banco com Docker

## Criar o arquivo

Na raiz do projeto, crie:

```bash
docker-compose.yml
```

---

## 📄 Conteúdo do arquivo

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15
    container_name: irrigacao-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 1234
      POSTGRES_DB: irrigacao_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    container_name: irrigacao-pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@email.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## Rodar o container

```bash
docker-compose up -d
```

---

## Verificar containers

```bash
docker ps
```

Você deve ver:

* irrigacao-postgres
* irrigacao-pgadmin

---

# 2. Acessando o pgAdmin

Abra no navegador:

```
http://localhost:5050
```

### Login

* Email: `admin@email.com`
* Senha: `admin123`

---

## Adicionar servidor

### Aba **General**

* Name: `Postgres Local`

### Aba **Connection**

* Host: `postgres`
* Port: `5432`
* Username: `postgres`
* Password: `1234`

---

# 3. Executando o Script SQL

## Passos

1. Expandir o servidor
2. Selecionar o banco `irrigacao_db`
3. Botão direito >> **Query Tool**

---

## Executar script

* Cole o arquivo SQL completo (`001_create_tables.sql`)
* Clique no botão **Run**

---

## Resultado esperado

* Tabelas criadas com sucesso
* Sem erros

---

# 4. Inserindo Dados de Teste

```sql
-- Usuario
INSERT INTO usuarios (nome, email, senha, cargo)
VALUES ('Bolsonaro', 'bonoro@email.com', '123', 'admin');

-- Fazenda
INSERT INTO fazenda (nome, localizacao)
VALUES ('Fazenda Teste', 'SP');

-- Talhao
INSERT INTO talhao (fazenda_id, nome, cultura, area)
VALUES (1, 'Talhão A', 'Soja', 10);

-- Dispositivo
INSERT INTO dispositivo (usuario_id, nome, status, modo)
VALUES (1, 'ESP32', 'ligado', 'auto');

-- Sensor
INSERT INTO sensores (dispositivo_id, tipo, unidade)
VALUES (1, 'umidade', '%');
```

---

# 5. Inserindo Leituras (Simulação IoT)

```sql
INSERT INTO leitura (sensor_id, valor, data_hora)
VALUES (1, 45.7, NOW());
```

---

# 6. Testando Queries Reais

## Última leitura do sensor

```sql
SELECT *
FROM leitura
WHERE sensor_id = 1
ORDER BY data_hora DESC
LIMIT 1;
```

---

## Média das últimas 24h

```sql
SELECT AVG(valor)
FROM leitura
WHERE sensor_id = 1
AND data_hora >= NOW() - INTERVAL '1 day';
```

---

## Histórico climático

```sql
SELECT *
FROM clima
WHERE talhao_id = 1
ORDER BY data_hora DESC;
```

---

## Alertas do talhão

```sql
SELECT *
FROM alerta
WHERE talhao_id = 1;
```

---

# 7. Validando Performance (Índices)

```sql
EXPLAIN ANALYZE
SELECT *
FROM leitura
WHERE sensor_id = 1
ORDER BY data_hora DESC
LIMIT 1;
```

---

## Resultado esperado

Deve aparecer algo como:

```
Index Scan
```

Isso indica que os índices estão funcionando corretamente.

---

# 8. Possíveis Problemas

## Não conecta no banco

Tente alterar o host:

* De: `postgres`
* Para: `localhost`

---

## Porta ocupada

Altere no `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```