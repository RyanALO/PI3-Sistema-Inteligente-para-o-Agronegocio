require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function seed() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash  = await bcrypt.hash('123456', 10);

  await pool.query(
    'UPDATE usuarios SET senha = $1 WHERE email = $2',
    [adminHash, 'admin@agrotech.com']
  );
  await pool.query(
    'UPDATE usuarios SET senha = $1 WHERE email = $2',
    [userHash, 'gustavinho@agrotech.com']
  );

  console.log('✅ Senhas atualizadas com sucesso!');
  await pool.end();
}

seed().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
