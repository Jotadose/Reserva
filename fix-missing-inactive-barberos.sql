-- Identificar barberos que están en usuarios pero no en barberos
-- y crear los registros faltantes

BEGIN;

-- 1. Ver qué barberos están en usuarios pero NO en barberos
SELECT 
  u.id_usuario,
  u.nombre,
  u.email,
  u.activo,
  CASE WHEN b.id_barbero IS NULL THEN 'FALTA EN BARBEROS' ELSE 'OK' END as estado
FROM usuarios u
LEFT JOIN barberos b ON b.id_barbero = u.id_usuario
WHERE u.rol = 'barbero'
ORDER BY u.activo DESC, u.nombre;

-- 2. Crear registros faltantes en tabla barberos para usuarios con rol 'barbero'
INSERT INTO barberos (
  id_barbero, 
  servicios, 
  horario_inicio, 
  horario_fin, 
  dias_trabajo, 
  tiempo_descanso,
  comision_base,
  biografia,
  activo
)
SELECT 
  u.id_usuario,
  '["660e8400-e29b-41d4-a716-446655440001"]'::jsonb, -- Corte Básico por defecto
  '09:00:00'::time,
  '18:00:00'::time,
  ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
  15,
  0,
  'Barbero profesional',
  u.activo
FROM usuarios u
LEFT JOIN barberos b ON b.id_barbero = u.id_usuario
WHERE u.rol = 'barbero' 
  AND b.id_barbero IS NULL; -- Solo crear para los que NO existen

-- 3. Verificar el resultado final
SELECT 
  u.id_usuario,
  u.nombre,
  u.email,
  u.activo as usuario_activo,
  b.activo as barbero_activo,
  b.servicios
FROM usuarios u
JOIN barberos b ON b.id_barbero = u.id_usuario
WHERE u.rol = 'barbero'
ORDER BY u.activo DESC, u.nombre;

COMMIT;
