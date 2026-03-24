const mqtt = require('mqtt');

// Connect to local MQTT broker
const client = mqtt.connect('mqtt://localhost:1883');

const devices = ['sensor01', 'sensor02', 'sensor03', 'sensor04', 'sensor05', 'sensor06'];
const locations = {
  sensor01: 'linha1/maquinaA',
  sensor02: 'linha1/maquinaB',
  sensor03: 'linha1/maquinaC',
  sensor04: 'linha2/maquinaA',
  sensor05: 'linha2/maquinaB',
  sensor06: 'linha2/maquinaC',
};

client.on('connect', () => {
  console.log('🔌 Simulator connected to MQTT broker');
  console.log('📡 Publishing sensor data every 5 seconds...');
  console.log('Press Ctrl+C to stop.\n');

  // Publish data every 5 seconds
  setInterval(() => {
    const device = devices[Math.floor(Math.random() * devices.length)];
    const topic = `industria/${locations[device]}/dados`;

    const payload = {
      deviceId: device,
      timestamp: new Date().toISOString(),
      temperature: Math.round((20 + Math.random() * 20) * 10) / 10,
      humidity: Math.round((40 + Math.random() * 40) * 10) / 10,
      soil_moisture: Math.round((20 + Math.random() * 50) * 10) / 10,
      pressure: Math.round((1000 + Math.random() * 30) * 10) / 10,
    };

    client.publish(topic, JSON.stringify(payload));
    console.log(`📨 [${new Date().toLocaleTimeString()}] ${topic} → T:${payload.temperature}°C H:${payload.humidity}% S:${payload.soil_moisture}%`);
  }, 5000);
});

client.on('error', (err) => {
  console.error('❌ MQTT connection error:', err.message);
  console.log('Make sure the backend server is running (node server.js)');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Simulator stopped');
  client.end();
  process.exit(0);
});
