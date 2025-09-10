-- Limpiar y normalizar datos de servicios en tabla barberos
-- Ejecutar en Supabase SQL Editor

BEGIN;

-- 1. Obtener IDs de servicios disponibles
-- (Estos IDs deben coincidir con los de tu tabla servicios)
WITH servicios_disponibles AS (
  SELECT id_servicio, nombre FROM servicios ORDER BY nombre
),

-- 2. Mapeo de servicios texto -> ID
mapeo_servicios AS (
  SELECT 
    'Corte Basico'::text AS texto,
    '660e8400-e29b-41d4-a716-446655440001'::text AS id_servicio
  UNION ALL SELECT 'Corte Premium', '660e8400-e29b-41d4-a716-446655440002'
  UNION ALL SELECT 'Arreglo de Barba', '660e8400-e29b-41d4-a716-446655440003'
  UNION ALL SELECT 'Barba Completa', '660e8400-e29b-41d4-a716-446655440004'
  UNION ALL SELECT 'Degradado', '660e8400-e29b-41d4-a716-446655440005'
  UNION ALL SELECT 'Combo Completo', '660e8400-e29b-41d4-a716-446655440006'
  UNION ALL SELECT 'Coloracion', 'f7e294c0-3059-4c2a-8ef3-4c79288a8638'
  -- Mapeos adicionales para textos existentes
  UNION ALL SELECT 'corte', '660e8400-e29b-41d4-a716-446655440001'
  UNION ALL SELECT 'coloracion', 'f7e294c0-3059-4c2a-8ef3-4c79288a8638'
  UNION ALL SELECT 'styling', '660e8400-e29b-41d4-a716-446655440002'
  UNION ALL SELECT 'barba', '660e8400-e29b-41d4-a716-446655440003'
)

-- 3. Actualizar barberos con servicios NULL o vacíos
UPDATE barberos 
SET servicios = '["660e8400-e29b-41d4-a716-446655440001"]'::jsonb -- Corte Básico por defecto
WHERE servicios IS NULL 
   OR servicios = '[]'::jsonb 
   OR jsonb_array_length(servicios) = 0;

-- 4. Mostrar el estado actual para revisión
SELECT 
  b.id_barbero,
  u.nombre,
  b.servicios,
  jsonb_array_length(b.servicios) as num_servicios
FROM barberos b
JOIN usuarios u ON u.id_usuario = b.id_barbero
ORDER BY u.nombre;

COMMIT;

-- 5. Verificar que todos los barberos tengan al menos un servicio
SELECT 
  COUNT(*) as total_barberos,
  COUNT(CASE WHEN servicios IS NULL OR jsonb_array_length(servicios) = 0 THEN 1 END) as sin_servicios
FROM barberos;
