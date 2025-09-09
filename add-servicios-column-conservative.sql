-- MIGRACIÓN CONSERVADORA: Agregar columna "servicios" sin eliminar "especialidades"
-- Esta migración permite una transición gradual

BEGIN;

-- 1. Agregar nueva columna "servicios" (JSON array) si no existe
ALTER TABLE barberos 
ADD COLUMN IF NOT EXISTS servicios JSONB DEFAULT '[]'::jsonb;

-- 2. Comentario en la tabla
COMMENT ON COLUMN barberos.servicios IS 'IDs de servicios que ofrece el barbero (JSON array) - Nueva implementación';

-- 3. Crear índice para mejorar performance en búsquedas
CREATE INDEX IF NOT EXISTS idx_barberos_servicios ON barberos USING GIN (servicios);

-- 4. Poblar la nueva columna con datos de prueba basados en especialidades existentes
-- (Solo si existe la columna especialidades y servicios está vacía)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'barberos' AND column_name = 'especialidades'
    ) THEN
        -- Mapeo básico de especialidades a IDs de servicios (ajustar según tu catálogo)
        UPDATE barberos 
        SET servicios = 
            CASE 
                WHEN especialidades IS NULL THEN '[]'::jsonb
                WHEN array_length(especialidades, 1) IS NULL THEN '[]'::jsonb
                -- Mapeo de ejemplo (ajustar con tus IDs reales de servicios)
                WHEN 'Corte' = ANY(especialidades) THEN '["660e8400-e29b-41d4-a716-446655440001"]'::jsonb
                WHEN 'Barba' = ANY(especialidades) THEN '["660e8400-e29b-41d4-a716-446655440002"]'::jsonb
                WHEN 'Afeitado' = ANY(especialidades) THEN '["660e8400-e29b-41d4-a716-446655440003"]'::jsonb
                ELSE to_jsonb(especialidades) -- Conversión directa como fallback
            END
        WHERE servicios = '[]'::jsonb OR servicios IS NULL;
        
        RAISE NOTICE 'Datos migrados de especialidades a servicios';
    ELSE
        RAISE NOTICE 'Columna especialidades no encontrada. Solo se creó la columna servicios.';
    END IF;
END
$$;

COMMIT;

-- 5. Verificación final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'barberos' 
  AND column_name IN ('servicios', 'especialidades')
ORDER BY column_name;

-- Mostrar algunos registros de ejemplo
SELECT 
    id_barbero,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'barberos' AND column_name = 'especialidades'
    ) THEN 'especialidades disponibles'
    ELSE 'sin especialidades'
    END as estado_especialidades,
    servicios
FROM barberos 
LIMIT 3;
