## ☁️ Migração para Nuvem (Produção)

Atualmente o sistema utiliza um ambiente local com Docker para simular a nuvem. Para migrar para uma infraestrutura real, algumas alterações são necessárias.

---


## Componentes Utilizados

### Hardware

* ESP32
* Sensor capacitivo de umidade do solo
* Módulo relé
* Bomba d'água (5V)
* Fonte externa (carregador USB 5V)
* Protoboard e jumpers

### Software

* Arduino IDE
* Docker + Docker Compose
* Mosquitto (MQTT Broker)
* Node-RED
* InfluxDB
* Grafana

---

## Principais Mudanças

### 1. Broker MQTT (Mosquitto → Cloud)

Atualmente:

```text
Broker: 192.168.x.x (rede local)
Porta: 1883
```

Na nuvem:

```text
Broker: <ENDEREÇO_PUBLICO>
Porta: 1883 ou 8883 (TLS)
```

### Opções de Broker:

* AWS IoT Core
* HiveMQ Cloud
* EMQX Cloud

---

### 2. Segurança (ESSENCIAL)

No ambiente local:

* Sem autenticação
* Sem criptografia

Na nuvem:

* Usuário e senha **ou**
* Certificados (TLS)
* Comunicação segura (porta 8883)

---

### 3. Código do ESP32

#### 🔴 Antes (local)

```cpp
const char* mqtt_server = "192.168.0.105";
```

#### 🟢 Depois (nuvem)

```cpp
const char* mqtt_server = "broker.hivemq.com"; // exemplo
```

Ou usando TLS:

```cpp
WiFiClientSecure espClient;
```

---

### 4. Node-RED

Atualmente:

```text
Rodando em Docker local
```

Na nuvem:

* Pode ser hospedado em:

  * VPS
  * AWS EC2
  * Railway

Ou substituído por:

* Serviços serverless
* APIs backend

---

### 5. Banco de Dados (InfluxDB)

Atualmente:

```text
Local (Docker)
```

Na nuvem:

* InfluxDB Cloud
* Ou alternativas:

  * Firebase
  * PostgreSQL
  * DynamoDB

---

### 6. Grafana

Atualmente:

```text
Rodando localmente
```

Na nuvem:

* Grafana Cloud
* Ou hospedado em servidor próprio

---

## Arquitetura na Nuvem

```mermaid
    flowchart LR
    ESP32[ESP32] --> WIFI[Wi-Fi]
    WIFI --> NET[Internet]
    NET --> MQTT[MQTT Broker AWS]
    MQTT --> NR[Backend / Node-RED AWS ]
    NR --> DB[Banco de Dados AWS]
    DB --> DASH[Dashboard AWS]
```

---

## Desafios na Migração

* Latência de rede
* Segurança (TLS obrigatório em muitos casos)
* Gerenciamento de credenciais
* Confiabilidade da conexão Wi-Fi

---

## Benefícios

* Acesso remoto (de qualquer lugar)
* Escalabilidade
* Persistência de dados
* Integração com outros sistemas

---

## 🔚 Conclusão

A migração para nuvem exige principalmente:

* Alteração do endereço do broker
* Implementação de segurança (TLS/autenticação)
* Adaptação dos serviços (Node-RED, banco e dashboard)

A arquitetura atual já está preparada para essa transição, exigindo apenas ajustes de configuração.
