const express = require('express');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const router = express.Router();

/**
 * GET /api/sensores-external
 * Proxy to the external AWS sensores endpoint to avoid CORS issues
 * The target URL can be configured via environment variable SENSORES_AWS_URL
 */
router.get('/', (req, res, next) => {
  const target = process.env.SENSORES_AWS_URL || 'http://44.212.9.241:3000/sensores';

  try {
    const url = new URL(target);
    const client = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search || ''}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };

    const proxyReq = client.request(options, (proxyRes) => {
      let body = '';
      proxyRes.on('data', chunk => body += chunk);
      proxyRes.on('end', () => {
        const status = proxyRes.statusCode || 502;

        // Try to parse JSON, otherwise return raw text
        try {
          const json = JSON.parse(body || 'null');
          return res.status(status).json(json);
        } catch (err) {
          return res.status(status).send(body);
        }
      });
    });

    proxyReq.on('error', (err) => {
      next(err);
    });

    proxyReq.end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
