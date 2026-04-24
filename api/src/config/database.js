const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Conectado ao PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool PostgreSQL:', err.message);
});

module.exports = pool;
