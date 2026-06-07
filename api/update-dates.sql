-- Update leitura to today
UPDATE leitura 
SET data_hora = NOW() - INTERVAL '1 hour' 
WHERE sensor_id IN (1, 2, 3, 4, 5, 6);

UPDATE leitura 
SET data_hora = NOW() - INTERVAL '3 hours' 
WHERE sensor_id IN (1, 2) AND data_hora < NOW() - INTERVAL '2 hours';

UPDATE leitura 
SET data_hora = NOW() - INTERVAL '6 hours' 
WHERE sensor_id IN (1, 2, 3, 4, 5, 6) AND data_hora < NOW() - INTERVAL '5 hours';

-- Update clima to today
UPDATE clima 
SET data_hora = NOW() - INTERVAL '1 hour' 
WHERE talhao_id IN (1, 2);

UPDATE clima 
SET data_hora = NOW() - INTERVAL '3 hours' 
WHERE talhao_id IN (1, 2) AND data_hora < NOW() - INTERVAL '2 hours';

UPDATE clima 
SET data_hora = NOW() - INTERVAL '6 hours' 
WHERE talhao_id IN (1, 2) AND data_hora < NOW() - INTERVAL '5 hours';

UPDATE clima 
SET data_hora = NOW() - INTERVAL '12 hours' 
WHERE talhao_id IN (1, 2) AND data_hora < NOW() - INTERVAL '11 hours';

UPDATE clima 
SET data_hora = NOW() - INTERVAL '18 hours' 
WHERE talhao_id IN (1, 2) AND data_hora < NOW() - INTERVAL '17 hours';

UPDATE clima 
SET data_hora = NOW() - INTERVAL '24 hours' 
WHERE talhao_id IN (1, 2) AND data_hora < NOW() - INTERVAL '23 hours';

-- Verify
SELECT 'leitura' as table_name, COUNT(*) as count, MIN(data_hora) as oldest, MAX(data_hora) as newest FROM leitura
UNION ALL
SELECT 'clima', COUNT(*), MIN(data_hora), MAX(data_hora) FROM clima;
