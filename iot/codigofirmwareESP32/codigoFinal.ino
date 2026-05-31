//===== Bibliotecas =====//
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <time.h>
#include <ArduinoJson.h>

unsigned long ultimoEnvio = 0;
const unsigned long intervaloEnvio = 30000;

//===== Config Wifi =====//
const char* ssid = ""; // Colocar o nome do seu wifi
const char* password = ""; // Colocar a senho do seu wifi

//===== Config MQTT =====//
const char* mqtt_server =
""; // Colocar o ip do broker mqtt/ domain aws iot core

//=====  Hardware Pinos e definicoes usados do ESP32 =====//
const char* device_id = "esp32_01";

//===== Tópicos MQTT =====//
String topicoTelemetria =
  "iot/rega/" + String(device_id) + "/telemetria";

String topicoComandoBomba =
  "iot/rega/" + String(device_id) + "/comando/bomba";

String topicoStatusDevice =
  "iot/rega/" + String(device_id) + "/status/device";

String topicoStatusBomba =
  "iot/rega/" + String(device_id) + "/status/bomba";

#define DHTIN 4
#define DHTTYPE DHT11

#define SENSOR_SOLO 34
#define RELE_PIN 26

//===== Objetos =====//
WiFiClientSecure espClient;
PubSubClient client(espClient);
DHT dht(DHTIN, DHTTYPE);

//===== Variaveis Globais  =====//
//=== Sensores ===//
bool bombaLigada = false;
float temperatura = 0;
float umidadeAr = 0;
int umidadeSolo = 0;

//=== Wifi Mqtt ===//
unsigned long ultimaTentativaWiFi = 0;
unsigned long ultimaTentativaMQTT = 0;


const unsigned long intervaloWiFi = 10000;
const unsigned long intervaloMQTT = 5000;

//=== Atuadores ===//
unsigned long instanteMudancaBomba = 0;

bool modoManual = false;

const unsigned long tempoMinimoLigada = 10000;

const unsigned long tempoMinimoDesligada = 30000;

//==== Certificados AWS ====//
const char* root_ca = R"";

const char* certificate_pem_crt = R"";

const char* private_pem_key = R"";

//===== Conexao com WIFI =====//
void setup_wifi() {

  Serial.println();
  Serial.print("Conectando no WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
}

//===== MQTT callback =====//
void callback(char* topic, byte* payload, unsigned int length) {

  char mensagem[length + 1];

  memcpy(mensagem, payload, length);

  mensagem[length] = '\0';

  Serial.print("Mensagem MQTT: ");
  Serial.println(mensagem);

  StaticJsonDocument<256> doc;

  DeserializationError error =
    deserializeJson(doc, mensagem);

  if (error) {

    Serial.println("Erro ao interpretar JSON");

    return;
  }

  // ===== Verifica tópico =====
  if (String(topic) == topicoComandoBomba) {

    String modo = doc["modo"];

    // ===== MODO MANUAL =====
    if (modo == "manual") {

      modoManual = true;

      bool estadoBomba = doc["bomba"];

      if (estadoBomba) {

        digitalWrite(RELE_PIN, LOW);

        bombaLigada = true;

        client.publish(
          topicoStatusBomba.c_str(),
          "LIGADA",
          true
        );

        Serial.println("Bomba ligada manualmente");

      } else {

        digitalWrite(RELE_PIN, HIGH);

        bombaLigada = false;

        client.publish(
          topicoStatusBomba.c_str(),
          "DESLIGADA",
          true
        );

        Serial.println("Bomba desligada manualmente");
      }
    }

    // ===== MODO AUTOMATICO =====
    else if (modo == "automatico") {

      modoManual = false;

      Serial.println("Modo automatico ativado");
    }
  }
}

//===== Reconectar no Broker MQTT =====//
void reconnectMQTT() {

  if (WiFi.status() != WL_CONNECTED) {
  return;
  }

  if (client.connected()) {
    return;
  }

  unsigned long agora = millis();

  if (agora - ultimaTentativaMQTT >= intervaloMQTT) {

    ultimaTentativaMQTT = agora;

    Serial.println("Tentando conectar MQTT...");

    if (client.connect(
        device_id,
        topicoStatusDevice.c_str(),
        1,
        true,
        "OFFLINE"
      )) {

      Serial.println("MQTT conectado!");

      client.subscribe(topicoComandoBomba.c_str());

      client.publish(
        topicoStatusDevice.c_str(),
        "ONLINE",
        true
      );

    } else {

      Serial.print("Falha MQTT. Código: ");

      Serial.println(client.state());
    }
  }
}

void lerSensores() {

  // ===== DHT11 =====
  temperatura = dht.readTemperature();
  umidadeAr = dht.readHumidity();

  // ===== Tratamento erro DHT =====
  if (isnan(temperatura) || isnan(umidadeAr)) {

    Serial.println("Erro ao ler DHT11");

    return;
  }

  // ===== Média sensor solo =====
  int soma = 0;

  for (int i = 0; i < 10; i++) {

    soma += analogRead(SENSOR_SOLO);

    delay(10);
  }

  int leituraSolo = soma / 10;

  umidadeSolo = map(leituraSolo, 3150, 1200, 0, 100);

  umidadeSolo = constrain(umidadeSolo, 0, 100);
}

void mostrarLeituras() {

  Serial.println("===== LEITURAS =====");

  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.println(" °C");

  Serial.print("Umidade do ar: ");
  Serial.print(umidadeAr);
  Serial.println(" %");

  Serial.print("Umidade do solo: ");
  Serial.print(umidadeSolo);
  Serial.println(" %");

  Serial.println("========================");
}

void enviarMQTT() {

  StaticJsonDocument<256> doc;

  doc["temperatura"] = temperatura;
  doc["umidade_ar"] = umidadeAr;
  doc["umidade_solo"] = umidadeSolo;
  doc["bomba"] = bombaLigada;

  doc["modo"] =
modoManual ? "manual" : "automatico";

  char buffer[256];

  serializeJson(doc, buffer);

  client.publish(
    topicoTelemetria.c_str(),
    buffer,
    true
  );

  Serial.println("Telemetria enviada:");
  Serial.println(buffer);
}

void controlarIrrigacao() {

  if (modoManual) {
    return;
  }

  unsigned long agora = millis();

  // ===== Liga bomba =====
  if (
    umidadeSolo < 30 &&
    !bombaLigada &&
    (agora - instanteMudancaBomba >= tempoMinimoDesligada)
  ) {

    digitalWrite(RELE_PIN, LOW);

    bombaLigada = true;

    instanteMudancaBomba = agora;

    client.publish(
        topicoStatusBomba.c_str(),
        "LIGADA",
        true
      );

    Serial.println("Irrigação automática ativada");
  }

  // ===== Desliga bomba =====
  if (
    umidadeSolo > 70 &&
    bombaLigada &&
    (agora - instanteMudancaBomba >= tempoMinimoLigada)
  ) {

    digitalWrite(RELE_PIN, HIGH);

    bombaLigada = false;

    instanteMudancaBomba = agora;

    client.publish(
      topicoStatusBomba.c_str(),
      "DESLIGADA",
      true
    );

    Serial.println("Irrigação automática desligada");
  }
}

void verificarWiFi() {

  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long agora = millis();

  if (agora - ultimaTentativaWiFi >= intervaloWiFi) {

    ultimaTentativaWiFi = agora;

    Serial.println("WiFi desconectado. Tentando reconectar...");

    WiFi.disconnect();

    WiFi.begin(ssid, password);
  }
}

void sincronizarHorario() {

  configTime(
    -3 * 3600,
    0,
    "pool.ntp.org",
    "time.nist.gov"
  );

  Serial.print("Sincronizando horario");

  time_t now = time(nullptr);

  while (now < 8 * 3600 * 2) {

    delay(500);

    Serial.print(".");

    now = time(nullptr);
  }

  Serial.println("");
  Serial.println("Horario sincronizado!");
}

void setup() {

  Serial.begin(115200);

  //===== PINOS =====//
  pinMode(RELE_PIN, OUTPUT);

  //===== RELE DESLIGADO INICIALMENTE =====//
  digitalWrite(RELE_PIN, HIGH);

  //===== DHT =====//
  dht.begin();

  //===== WIFI =====//
  setup_wifi();

  sincronizarHorario();

  //===== MQTT =====//
  client.setServer(mqtt_server, 8883);
  client.setCallback(callback);

  espClient.setCACert(root_ca);

  espClient.setCertificate(certificate_pem_crt);

  espClient.setPrivateKey(private_pem_key);

  Serial.println("Sistema iniciado!");
}

void loop() {

verificarWiFi();

reconnectMQTT();

if (client.connected()) {
  client.loop();
}

  // ===== Controle de tempo =====
  unsigned long agora = millis();

  if (agora - ultimoEnvio >= intervaloEnvio) {

    ultimoEnvio = agora;

    lerSensores();

    mostrarLeituras();

    enviarMQTT();

    controlarIrrigacao();
  }
}
