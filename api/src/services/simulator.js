const pool = require('../config/database');
const brain = require('./brain');

class Simulator {
  constructor() {
    this.intervalId = null;
    this.timerMs = 15000; // 15 segundos para fins de demonstração (rápida captação)
  }

  async start() {
    console.log('📡 [IoT Simulator] Inicializando simulação de sensores MQTT...');
    this.intervalId = setInterval(() => this.simulateReadings(), this.timerMs);
    // Dispara a primeira vez imediatamente
    await this.simulateReadings();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('📡 [IoT Simulator] Simulação de sensores parada.');
    }
  }

  async simulateReadings() {
    try {
      // 1. Busca todos os sensores cujos dispositivos gerenciadores estão ativos
      const { rows: sensores } = await pool.query(`
        SELECT s.id, s.tipo 
        FROM sensores s
        JOIN dispositivo d ON d.id = s.dispositivo_id
        WHERE d.status = 'ativo'
      `);

      if (sensores.length === 0) return;

      const baseDate = new Date();

      for (const sensor of sensores) {
        // 2. Gera valores orgânicos aleatórios
        let valor = 0;
        if (sensor.tipo === 'umidade_solo') {
          // Maioria das vezes cai lentamente, a não ser que regue. Mas faremos oscilar entre 20 e 80 para teste
          valor = (Math.random() * (80 - 20) + 20).toFixed(1);
        } else if (sensor.tipo === 'temperatura') {
          valor = (Math.random() * (35 - 18) + 18).toFixed(1);
        } else if (sensor.tipo === 'pluviometria') {
          valor = (Math.random() > 0.8 ? Math.random() * 20 : 0).toFixed(1); // 20% chove
        } else {
          valor = (Math.random() * 100).toFixed(1);
        }

        // 3. Insere a leitura real simulando o Broker MQTT
        await pool.query(
          'INSERT INTO leitura (sensor_id, valor, data_hora) VALUES ($1, $2, $3)',
          [sensor.id, valor, baseDate]
        );

        // 4. Passa a bola para a Inteligência Autônoma (Cérebro do AgroTech) analisar imediatamente
        brain.evaluateReading(sensor, parseFloat(valor));
      }
    } catch (err) {
      console.error('❌ [IoT Simulator] Falha ao simular sensores:', err.message);
    }
  }
}

module.exports = new Simulator();
