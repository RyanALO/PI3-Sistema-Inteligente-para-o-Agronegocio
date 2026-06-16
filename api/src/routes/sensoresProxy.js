const express = require('express');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const router = express.Router();

/**
 * Tenta buscar os sensores do endpoint AWS externo.
 * Retorna null se houver timeout ou erro de conexão.
 */
function fetchFromAws(target, timeoutMs = 5000) {
  return new Promise((resolve) => {
    try {
      const url = new URL(target);
      const client = url.protocol === 'https:' ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search || ''}`,
        method: 'GET',
        headers: { Accept: 'application/json' },
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(body || 'null');
            resolve({ status: res.statusCode, data: json });
          } catch {
            resolve(null);
          }
        });
      });

      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve(null); // timeout → fallback
      });

      req.on('error', () => resolve(null)); // conexão recusada → fallback
      req.end();
    } catch {
      resolve(null);
    }
  });
}

/**
 * Busca dados dos sensores do banco de dados local (simulador IoT).
 * Agrupa as últimas leituras de umidade_solo, temperatura e umidade (ar)
 * por dispositivo, retornando no mesmo formato esperado pelo mobile.
 */
async function fetchFromLocalDb() {
  // Importação lazy para não quebrar quando o banco não está disponível
  let pool;
  try {
    pool = require('../config/database');
  } catch {
    return null;
  }

  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (s.dispositivo_id, s.tipo)
        s.dispositivo_id  AS id,
        s.tipo,
        l.valor
      FROM sensores s
      JOIN dispositivo d ON d.id = s.dispositivo_id AND d.status = 'ativo'
      JOIN leitura l     ON l.sensor_id = s.id
      ORDER BY s.dispositivo_id, s.tipo, l.data_hora DESC
    `);

    if (rows.length === 0) return null;

    // Agrupa por dispositivo_id → { id, temperatura, umidade_solo, umidade }
    const devicesMap = {};
    for (const row of rows) {
      const devId = row.id;
      if (!devicesMap[devId]) {
        devicesMap[devId] = { id: devId, temperatura: null, umidade_solo: null, umidade: null };
      }
      if (row.tipo === 'temperatura')   devicesMap[devId].temperatura   = parseFloat(row.valor);
      if (row.tipo === 'umidade_solo')  devicesMap[devId].umidade_solo  = parseFloat(row.valor);
      if (row.tipo === 'umidade')       devicesMap[devId].umidade       = parseFloat(row.valor);
      // Sensores de chuva → mapeia umidade do ar aproximada quando não há sensor dedicado
      if (row.tipo === 'chuva' && devicesMap[devId].umidade === null) {
        devicesMap[devId].umidade = Math.min(100, 50 + parseFloat(row.valor) * 2);
      }
    }

    return Object.values(devicesMap);
  } catch (err) {
    console.error('❌ [SensoresProxy] Falha ao buscar do banco local:', err.message);
    return null;
  }
}

/**
 * GET /api/sensores/proxy
 * Proxy para o endpoint externo AWS de sensores.
 * Tenta AWS primeiro; se indisponível, usa dados do simulador local (banco).
 * Rota pública — sem autenticação.
 */
router.get('/', async (req, res, next) => {
  const target = process.env.SENSORES_AWS_URL || 'http://44.212.9.241:3000/sensores';

  try {
    // 1. Tenta AWS com timeout curto
    const awsResult = await fetchFromAws(target, 5000);

    if (awsResult && awsResult.status === 200 && Array.isArray(awsResult.data)) {
      res.setHeader('X-Data-Source', 'aws');
      return res.status(200).json(awsResult.data);
    }

    // 2. Fallback: banco de dados local (simulador IoT)
    console.warn('⚠️  [SensoresProxy] AWS indisponível — usando dados do simulador local.');
    const localData = await fetchFromLocalDb();

    if (localData && localData.length > 0) {
      res.setHeader('X-Data-Source', 'local-simulator');
      return res.status(200).json(localData);
    }

    // 3. Nenhuma fonte disponível → 503
    return res.status(503).json({
      success: false,
      error: 'Serviço de sensores temporariamente indisponível.',
      code: 503,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
