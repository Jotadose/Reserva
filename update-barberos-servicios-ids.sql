-- Actualizar servicios de barberos para usar IDs reales de la tabla servicios
-- en lugar de strings descriptivos

BEGIN;

-- Mapeo de servicios textuales a IDs reales
UPDATE barberos 
SET servicios = 
  CASE 
    -- Si contiene "corte" -> Corte Básico
    WHEN servicios::text LIKE '%corte%' THEN 
      '["660e8400-e29b-41d4-a716-446655440001"]'::jsonb
    
    -- Si contiene "barba" -> Arreglo de Barba  
    WHEN servicios::text LIKE '%barba%' THEN 
      '["660e8400-e29b-41d4-a716-446655440003"]'::jsonb
    
    -- Si contiene "coloracion" -> Coloración
    WHEN servicios::text LIKE '%coloracion%' THEN 
      '["f7e294c0-3059-4c2a-8ef3-4c79288a8638"]'::jsonb
    
    -- Combinaciones múltiples
    WHEN servicios::text LIKE '%corte%' AND servicios::text LIKE '%barba%' THEN 
      '["660e8400-e29b-41d4-a716-446655440001", "660e8400-e29b-41d4-a716-446655440003"]'::jsonb
    
    WHEN servicios::text LIKE '%corte%' AND servicios::text LIKE '%coloracion%' THEN 
      '["660e8400-e29b-41d4-a716-446655440001", "f7e294c0-3059-4c2a-8ef3-4c79288a8638"]'::jsonb
    
    -- Por defecto: Corte Básico
    ELSE '["660e8400-e29b-41d4-a716-446655440001"]'::jsonb
  END
WHERE servicios IS NOT NULL 
  AND servicios::text NOT LIKE '%660e8400%' -- Solo actualizar los que no tienen IDs ya
  AND servicios::text NOT LIKE '%f7e294c0%';

-- Verificar los cambios
SELECT 
  u.nombre,
  b.servicios,
  'ACTUALIZADO' as estado
FROM barberos b
JOIN usuarios u ON u.id_usuario = b.id_barbero
WHERE u.rol = 'barbero'
ORDER BY u.nombre;

COMMIT;
