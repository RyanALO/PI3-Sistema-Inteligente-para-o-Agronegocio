-- Clear and reinit data with today's dates
DELETE FROM leitura;
DELETE FROM clima;

-- Insert fresh leitura data
INSERT INTO leitura (sensor_id, valor, data_hora) VALUES
  (1, 62.5, NOW() - INTERVAL '1 hour'),
  (1, 60.1, NOW() - INTERVAL '3 hours'),
  (1, 58.3, NOW() - INTERVAL '6 hours'),
  (2, 28.4, NOW() - INTERVAL '1 hour'),
  (2, 27.9, NOW() - INTERVAL '3 hours'),
  (2, 26.1, NOW() - INTERVAL '6 hours'),
  (3, 45.2, NOW() - INTERVAL '1 hour'),
  (3, 44.8, NOW() - INTERVAL '2 hours'),
  (4, 31.0, NOW() - INTERVAL '1 hour'),
  (4, 30.2, NOW() - INTERVAL '2 hours'),
  (5, 0.0,  NOW() - INTERVAL '1 hour'),
  (6, 38.9, NOW() - INTERVAL '1 hour');

-- Insert fresh clima data
INSERT INTO clima (talhao_id, temperatura, umidade, chuva, data_hora) VALUES
  (1, 28.4, 62.5, 0.0,  NOW() - INTERVAL '1 hour'),
  (1, 27.9, 64.0, 0.0,  NOW() - INTERVAL '3 hours'),
  (1, 26.1, 68.2, 2.1,  NOW() - INTERVAL '6 hours'),
  (1, 25.3, 72.5, 5.3,  NOW() - INTERVAL '12 hours'),
  (1, 24.1, 75.1, 0.0,  NOW() - INTERVAL '18 hours'),
  (1, 23.8, 70.0, 0.0,  NOW() - INTERVAL '24 hours'),
  (2, 31.0, 45.2, 0.0,  NOW() - INTERVAL '1 hour'),
  (2, 30.2, 47.0, 0.0,  NOW() - INTERVAL '3 hours');

SELECT 'Fresh data inserted' as status;
SELECT COUNT(*) as leitura_count FROM leitura;
SELECT COUNT(*) as clima_count FROM clima;
