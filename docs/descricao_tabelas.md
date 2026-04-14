# Modelagem do Banco de Dados — Sistema de Irrigação Inteligente

## Visão Geral

Este banco de dados foi projetado para suportar um sistema de monitoramento e automação agrícola baseado em IoT, com foco em:

* Monitoramento de sensores (umidade, temperatura, etc.)
* Controle de irrigação automatizada
* Gestão de talhões
* Análise de produtividade
* Registro de eventos e alertas
* Gestão de estoque agrícola

O modelo segue a **3ª Forma Normal (3FN)**, garantindo:

* Redução de redundância
* Integridade referencial
* Escalabilidade

---

# Entidades do Sistema

---

## `usuarios`

Armazena os usuários do sistema.

| Campo      | Tipo      | Descrição                         |
| ---------- | --------- | --------------------------------- |
| id         | SERIAL PK | Identificador único               |
| nome       | VARCHAR   | Nome do usuário                   |
| email      | VARCHAR   | Email único                       |
| senha | TEXT      | Senha criptografada               |
| cargo      | VARCHAR   | Tipo de usuário (admin, operador) |
| data_criacao | TIMESTAMP | Data de criação                   |

---

## `equipes`

Representa equipes de usuários.

| Campo    | Tipo      | Descrição              |
| -------- | --------- | ---------------------- |
| id       | SERIAL PK | Identificador          |
| nome     | VARCHAR   | Nome da equipe         |
| lider_id | FK        | Usuário dono da equipe |

---

## `usuario_equipe`

Relaciona usuários às equipes (N:N).

| Campo   | Tipo      | Descrição       |
| ------- | --------- | --------------- |
| id      | SERIAL PK | Identificador   |
| usuario_id | FK        | Usuário         |
| equipe_id | FK        | Equipe          |
| cargo_time    | VARCHAR   | Papel na equipe |

---

## `fazenda`

Representa fazendas.

| Campo       | Tipo      | Descrição       |
| ----------- | --------- | --------------- |
| id          | SERIAL PK | Identificador   |
| nome        | VARCHAR   | Nome da fazenda |
| localizacao | TEXT      | Localização     |

---

## `talhao`

Divisões da fazenda onde ocorre o plantio.

| Campo         | Tipo      | Descrição                           |
| ------------- | --------- | ----------------------------------- |
| id            | SERIAL PK | Identificador                       |
| fazenda_id       | FK        | Fazenda                             |
| nome          | VARCHAR   | Nome do talhão                      |
| cultura       | VARCHAR   | Tipo de cultura                     |
| area          | FLOAT     | Área (hectares)                     |
| data_plantio  | DATE      | Data de plantio                     |
| data_colheita | DATE      | Data de colheita                    |
| status        | VARCHAR   | Estado (saudável, crítico, atenção) |
| latitude      | FLOAT     | Coordenada geográfica               |
| longitude     | FLOAT     | Coordenada geográfica               |

---

## `dispositivo`

Dispositivos físicos conectados ao sistema.

| Campo   | Tipo      | Descrição            |
| ------- | --------- | -------------------- |
| id      | SERIAL PK | Identificador        |
| usuario_id | FK        | Dono do dispositivo  |
| nome    | VARCHAR   | Nome                 |
| status  | VARCHAR   | Ligado/desligado     |
| modo    | VARCHAR   | Manual ou automático |

---

## `sensores`

Sensores conectados aos dispositivos.

| Campo     | Tipo      | Descrição                   |
| --------- | --------- | --------------------------- |
| id        | SERIAL PK | Identificador               |
| dispositivo_id | FK        | Dispositivo                 |
| tipo      | VARCHAR   | Tipo (umidade, temperatura) |
| unidade   | VARCHAR   | Unidade de medida           |

---

## `talhao_sensor`

Relacionamento entre sensores e talhões (N:N).

| Campo     | Tipo      | Descrição     |
| --------- | --------- | ------------- |
| id        | SERIAL PK | Identificador |
| talhao_id   | FK        | Talhão        |
| sensor_id | FK        | Sensor        |

---

## `leitura`

Armazena leituras dos sensores.

| Campo     | Tipo      | Descrição          |
| --------- | --------- | ------------------ |
| id        | SERIAL PK | Identificador      |
| sensor_id | FK        | Sensor             |
| valor     | FLOAT     | Valor da leitura   |
| data_hora | TIMESTAMP | Momento da leitura |

**Observação:**
Tabela de alta volumetria — requer índices e possível particionamento.

---

## `clima`

Histórico climático por talhão.

| Campo       | Tipo      | Descrição       |
| ----------- | --------- | --------------- |
| id          | SERIAL PK | Identificador   |
| talhao_id     | FK        | Talhão          |
| temperatura | FLOAT     | Temperatura     |
| umidade     | FLOAT     | Umidade do ar   |
| chuva       | FLOAT     | Volume de chuva |
| data_hora   | TIMESTAMP | Data/hora       |

---

## `irrigacao`

Eventos de irrigação.

| Campo           | Tipo      | Descrição         |
| --------------- | --------- | ----------------- |
| id              | SERIAL PK | Identificador     |
| talhao_id         | FK        | Talhão            |
| dispositivo_id       | FK        | Dispositivo       |
| inicio          | TIMESTAMP | Início            |
| fim             | TIMESTAMP | Fim               |
| modo            | VARCHAR   | Manual/automático |
| quantidade_agua | FLOAT     | Volume utilizado  |

---

## `alerta`

Alertas gerados pelo sistema.

| Campo      | Tipo      | Descrição      |
| ---------- | --------- | -------------- |
| id         | SERIAL PK | Identificador  |
| talhao_id    | FK        | Talhão         |
| nome       | VARCHAR   | Titulo do alerta |
| tipo       | VARCHAR   | Tipo do alerta |
| mensagem   | TEXT      | Descrição      |
| nivel      | VARCHAR   | Severidade     |
| data_emitido | TIMESTAMP | Data           |

---

## `rendimento`

Histórico de produtividade.

| Campo          | Tipo      | Descrição         |
| -------------- | --------- | ----------------- |
| id             | SERIAL PK | Identificador     |
| talhao_id        | FK        | Talhão            |
| producao_total | FLOAT     | Produção total    |
| area_utilizada | FLOAT     | Área utilizada    |
| produtividade  | FLOAT     | Produção por área |
| data_colheita  | DATE      | Data              |

**Regra de negócio:**

```
produtividade = producao_total / area_utilizada
```

---

## `estoque`

Controle de estoque da fazenda.

| Campo          | Tipo      | Descrição        |
| -------------- | --------- | ---------------- |
| id             | SERIAL PK | Identificador    |
| fazenda_id        | FK        | Fazenda          |
| nome_produto   | VARCHAR   | Nome             |
| tipo           | VARCHAR   | Categoria        |
| quantidade     | FLOAT     | Quantidade       |
| custo_unitario | FLOAT     | Custo            |
| data_validade  | DATE      | Validade         |
| fornecedor     | VARCHAR   | Marca/fornecedor |

---

# Relacionamentos principais

* Um usuário pode possuir vários dispositivos
* Uma fazenda possui vários talhões
* Um talhão pode ter vários sensores
* Sensores geram múltiplas leituras
* Talhões possuem eventos, alertas e histórico climático

---

# Considerações de Performance

* Índices em:

  * `leitura (sensor_id, data_hora)`
  * `alertas (talhao_id)`
  * `clima (talhao_id, data_hora)`
* Possível particionamento de `leitura`
* Preparado para alto volume de dados (IoT)

---

# Conclusão

O modelo foi projetado para:

* Escalabilidade em ambientes IoT
* Facilidade de integração com APIs
* Suporte a análise de dados e BI agrícola
* Alta performance em consultas críticas

---
