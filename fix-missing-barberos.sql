-- Crear registros faltantes en tabla barberos para usuarios con rol 'barbero'
-- que no tienen registro en la tabla barberos

BEGIN;

-- Insertar barberos faltantes
INSERT INTO barberos (id_barbero, servicios, horario_inicio, horario_fin, dias_trabajo, tiempo_descanso)
SELECT 
  u.id_usuario,
  '["660e8400-e29b-41d4-a716-446655440001"]'::jsonb as servicios, -- Corte Básico por defecto
  '09:00:00'::time as horario_inicio,
  '18:00:00'::time as horario_fin,
  ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as dias_trabajo,
  15 as tiempo_descanso
FROM usuarios u
LEFT JOIN barberos b ON b.id_barbero = u.id_usuario
WHERE u.rol = 'barbero' 
  AND u.activo = true
  AND b.id_barbero IS NULL; -- Solo los que NO están en barberos

-- Ver los barberos que se insertaron
SELECT 
  u.nombre,
  u.id_usuario,
  'INSERTADO' as estado
FROM usuarios u
JOIN barberos b ON b.id_barbero = u.id_usuario
WHERE u.rol = 'barbero'
  AND u.activo = true
  AND b.created_at > NOW() - INTERVAL '1 minute';

COMMIT;
