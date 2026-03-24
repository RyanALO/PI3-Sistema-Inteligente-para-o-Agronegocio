const { getDb, saveDb } = require('../db');

function setupMqttHandler(broker) {
  broker.on('client', (client) => {
    console.log(`📡 MQTT Client connected: ${client.id}`);
  });

  broker.on('clientDisconnect', (client) => {
    console.log(`📡 MQTT Client disconnected: ${client.id}`);
  });

  broker.on('publish', async (packet, client) => {
    if (!client) return; // Skip internal messages

    const topic = packet.topic;
    
    // Only process industry topics
    if (!topic.startsWith('industria/')) return;

    try {
      const payload = JSON.parse(packet.payload.toString());
      console.log(`📨 MQTT [${topic}]:`, payload);

      const db = await getDb();

      // Extract device_id from topic or payload
      const deviceId = payload.deviceId || payload.device_id || topic.split('/').pop();

      // Persist sensor data
      db.run(
        'INSERT INTO sensor_data (device_id, temperature, humidity, soil_moisture, pressure) VALUES (?, ?, ?, ?, ?)',
        [
          deviceId,
          payload.temperature || null,
          payload.humidity || null,
          payload.soil_moisture || payload.soilMoisture || null,
          payload.pressure || null
        ]
      );

      // Auto-generate alerts
      if (payload.temperature && payload.temperature > 40) {
        db.run(
          'INSERT INTO alertas (type, severity, title, message, device_id) VALUES (?, ?, ?, ?, ?)',
          ['temperature', 'danger', 'Temperatura Crítica', `Temperatura de ${payload.temperature}°C no sensor ${deviceId}`, deviceId]
        );
      }

      if ((payload.soil_moisture || payload.soilMoisture) && (payload.soil_moisture || payload.soilMoisture) < 20) {
        db.run(
          'INSERT INTO alertas (type, severity, title, message, device_id) VALUES (?, ?, ?, ?, ?)',
          ['moisture', 'warning', 'Umidade Baixa', `Solo com ${payload.soil_moisture || payload.soilMoisture}% de umidade no ${deviceId}`, deviceId]
        );
      }

      saveDb();
    } catch (err) {
      // Not JSON or processing error, ignore
      if (err instanceof SyntaxError) return;
      console.error('MQTT handler error:', err);
    }
  });

  console.log('✅ MQTT Handler configured — listening on topic: industria/#');
}

module.exports = { setupMqttHandler };
