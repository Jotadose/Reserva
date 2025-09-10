-- Verificar duplicados en tabla barberos
SELECT 
  id_barbero, 
  COUNT(*) as duplicates,
  array_agg(servicios) as all_servicios
FROM barberos 
GROUP BY id_barbero 
HAVING COUNT(*) > 1;

-- Ver todos los registros de barberos
SELECT 
  b.id_barbero,
  u.nombre,
  b.servicios,
  b.created_at
FROM barberos b
JOIN usuarios u ON u.id_usuario = b.id_barbero
ORDER BY u.nombre, b.created_at;
