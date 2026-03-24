const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('./db');

async function seed() {
  console.log('🌱 Seeding database...');
  const db = await getDb();

  // Create test user
  const hashedPassword = await bcrypt.hash('123456', 10);
  try {
    db.run('INSERT INTO users (name, email, password, role, farm_name) VALUES (?, ?, ?, ?, ?)',
      ['Carlos Mendes', 'carlos@agrotech.com', hashedPassword, 'admin', 'Fazenda Santa Helena']);
    db.run('INSERT INTO users (name, email, password, role, farm_name) VALUES (?, ?, ?, ?, ?)',
      ['Ana Pereira', 'ana@agrotech.com', hashedPassword, 'user', 'Fazenda Santa Helena']);
  } catch (e) {
    console.log('Users may already exist, skipping...');
  }

  // Create devices
  const devices = [
    ['sensor01', 'Sensor Temperatura A1', 'temperature', 'Talhão Norte A1'],
    ['sensor02', 'Sensor Umidade A1', 'humidity', 'Talhão Norte A1'],
    ['sensor03', 'Sensor Solo A1', 'soil_moisture', 'Talhão Norte A1'],
    ['sensor04', 'Sensor Temperatura B2', 'temperature', 'Talhão Leste B2'],
    ['sensor05', 'Sensor Umidade B2', 'humidity', 'Talhão Leste B2'],
    ['sensor06', 'Sensor Solo B2', 'soil_moisture', 'Talhão Leste B2'],
  ];

  devices.forEach(([id, name, type, location]) => {
    try {
      db.run('INSERT INTO devices (id, name, type, location, status) VALUES (?, ?, ?, ?, ?)',
        [id, name, type, location, 'active']);
    } catch (e) { /* ignore duplicates */ }
  });

  // Create sample sensor data (last 24 hours)
  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 3600000).toISOString();
    const baseTemp = 25 + Math.random() * 10;
    const baseHumidity = 50 + Math.random() * 30;
    const baseMoisture = 30 + Math.random() * 30;

    devices.forEach(([id]) => {
      db.run(
        'INSERT INTO sensor_data (device_id, temperature, humidity, soil_moisture, pressure, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [
          id,
          Math.round((baseTemp + Math.random() * 5) * 10) / 10,
          Math.round((baseHumidity + Math.random() * 10) * 10) / 10,
          Math.round((baseMoisture + Math.random() * 10) * 10) / 10,
          Math.round((1013 + Math.random() * 10) * 10) / 10,
          timestamp
        ]
      );
    });
  }

  // Create sample alerts
  const alerts = [
    ['temperature', 'danger', 'Temperatura Crítica', 'Temperatura de 42°C detectada no Talhão Norte A1. Verificar sistema de irrigação.', 'sensor01'],
    ['moisture', 'warning', 'Umidade do Solo Baixa', 'Umidade do solo em 18% no Talhão Leste B2. Iniciar irrigação.', 'sensor06'],
    ['system', 'info', 'Manutenção Programada', 'Manutenção do sistema de irrigação agendada para amanhã às 08:00.', null],
  ];

  alerts.forEach(([type, severity, title, message, deviceId]) => {
    db.run(
      'INSERT INTO alertas (type, severity, title, message, device_id) VALUES (?, ?, ?, ?, ?)',
      [type, severity, title, message, deviceId]
    );
  });

  saveDb();
  console.log('✅ Database seeded successfully!');
  console.log('👤 Test user: carlos@agrotech.com / 123456');
  console.log('📊 6 devices, 150 sensor readings, 3 alerts created.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
