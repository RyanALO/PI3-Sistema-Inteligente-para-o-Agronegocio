const pool = require('../config/database');

class Brain {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    console.log('🧠 [Brain] Inicializando Algoritmo Autônomo e estruturando regras de negócio...');
    
    // Tabela fantasma para segurar a Inteligência do Sistema caso ainda não exista
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        id SERIAL PRIMARY KEY,
        irrigacao_automatica BOOLEAN DEFAULT true,
        umidade_minima NUMERIC DEFAULT 30,
        umidade_maxima NUMERIC DEFAULT 60
      );
      INSERT INTO configuracoes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `);

    this.initialized = true;
  }

  async getConfigs() {
    const { rows } = await pool.query('SELECT * FROM configuracoes WHERE id = 1');
    return rows[0];
  }

  /**
   * Avalia a leitura recém-chegada e toma decisões ativas na fazenda
   * @param {Object} sensor { id, tipo }
   * @param {Number} valor Leitura do sensor
   */
  async evaluateReading(sensor, valor) {
    if (!this.initialized) await this.init();

    // A inteligência primária roda ao redor da umidade do solo para regar
    if (sensor.tipo !== 'umidade_solo') return;

    try {
      const config = await this.getConfigs();

      // Se a automação estiver desligada totalmente pelo usuário
      if (!config.irrigacao_automatica) return;

      // Se o solo está secando num nível crítico (abaixo do teto mínimo configurado)
      if (valor < config.umidade_minima) {
        
        // Descobre onde este sensor está (Qual Talhão ele vigia)
        // e usa o próprio dispositivo do sensor como controlador de irrigação,
        // pois a tabela dispositivo não possui coluna fazenda_id.
        const { rows: infra } = await pool.query(`
          SELECT t.id AS talhao_id, s.dispositivo_id AS dispositivo_id, t.nome AS talhao_nome
          FROM talhao_sensors ts
          JOIN talhao t ON t.id = ts.talhao_id
          JOIN sensores s ON s.id = ts.sensor_id
          WHERE ts.sensor_id = $1 LIMIT 1
        `, [sensor.id]);

        if (infra.length === 0) return; // Talhão sem válvula conectada, impossível regar
        
        const { talhao_id, dispositivo_id, talhao_nome } = infra[0];

        // Regra Anti-Flood: Verifica se a fazenda já está regando este talhão neste exato momento!
        const { rows: irrigacaoAtiva } = await pool.query(`
          SELECT id FROM irrigacao 
          WHERE talhao_id = $1 AND fim > NOW()
        `, [talhao_id]);

        // Se já está chovendo ou regando autônomamente, não liga duas vezes
        if (irrigacaoAtiva.length > 0) return;

        console.log(`⚠️ [Brain] Alerta Crítico! ${talhao_nome} está com umidade em ${valor}%. (Mínimo: ${config.umidade_minima}%). Acionando bombas de água!`);

        const duracaoMinutos = 30; // Irrigação de 30 min por inteligência
        const quantidadeAgua = 200; 

        // 1. Gera o registro de Ligamento de Bomba no Banco com modo 'automático'
        const inicio = new Date();
        const fim = new Date(inicio.getTime() + duracaoMinutos * 60 * 1000);
        await pool.query(
          `INSERT INTO irrigacao (talhao_id, dispositivo_id, inicio, fim, modo, quantidade_agua)
           VALUES ($1, $2, $3, $4, 'automático', $5)`,
          [talhao_id, dispositivo_id, inicio, fim, quantidadeAgua]
        );

        // 2. Gera a notificação visual na aba de "Alertas" para o Cliente
        await pool.query(
          `INSERT INTO alerta (talhao_id, tipo, mensagem, nivel, resolvido)
           VALUES ($1, 'umidade_baixa', $2, 'warning', false)`,
          [talhao_id, `Umidade em ${valor}%. Sistema ativou a rega automática.`]
        );
      }
    } catch (err) {
      console.error('❌ [Brain] Erro no fluxo de análise algorítmica:', err.message);
    }
  }
}

module.exports = new Brain();
