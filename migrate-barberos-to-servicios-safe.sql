-- Migración segura: Cambiar columna "especialidades" por "servicios" en tabla barberos
-- Esta versión detecta el tipo de datos y hace la conversión correcta

BEGIN;

-- 1. Agregar nueva columna "servicios" (JSON array) si no existe
ALTER TABLE barberos 
ADD COLUMN IF NOT EXISTS servicios JSONB DEFAULT '[]'::jsonb;

-- 2. Migrar datos de "especialidades" a "servicios" con conversión de tipos
DO $$
DECLARE
    especialidades_type text;
BEGIN
    -- Verificar si la columna especialidades existe y obtener su tipo
    SELECT data_type INTO especialidades_type
    FROM information_schema.columns 
    WHERE table_name = 'barberos' 
      AND column_name = 'especialidades';

    IF especialidades_type IS NOT NULL THEN
        RAISE NOTICE 'Encontrada columna especialidades con tipo: %', especialidades_type;
        
        -- Migrar según el tipo de datos
        IF especialidades_type = 'ARRAY' OR especialidades_type LIKE '%[]' THEN
            -- Si es array de texto, convertir a JSONB
            RAISE NOTICE 'Convirtiendo array de texto a JSONB...';
            UPDATE barberos 
            SET servicios = CASE 
                WHEN especialidades IS NULL THEN '[]'::jsonb
                WHEN array_length(especialidades, 1) IS NULL THEN '[]'::jsonb
                ELSE to_jsonb(especialidades)
            END
            WHERE servicios = '[]'::jsonb OR servicios IS NULL;
            
        ELSIF especialidades_type = 'jsonb' THEN
            -- Si ya es JSONB, copiar directamente
            RAISE NOTICE 'Copiando JSONB directamente...';
            UPDATE barberos 
            SET servicios = COALESCE(especialidades, '[]'::jsonb)
            WHERE servicios = '[]'::jsonb OR servicios IS NULL;
            
        ELSIF especialidades_type = 'text' THEN
            -- Si es texto (posiblemente JSON string), parsear
            RAISE NOTICE 'Convirtiendo texto JSON a JSONB...';
            UPDATE barberos 
            SET servicios = CASE 
                WHEN especialidades IS NULL OR especialidades = '' THEN '[]'::jsonb
                ELSE especialidades::jsonb
            END
            WHERE servicios = '[]'::jsonb OR servicios IS NULL;
            
        ELSE
            RAISE NOTICE 'Tipo de datos no reconocido: %. Usando conversión por defecto.', especialidades_type;
            UPDATE barberos 
            SET servicios = '[]'::jsonb
            WHERE servicios = '[]'::jsonb OR servicios IS NULL;
        END IF;
        
        -- Mostrar estadísticas de la migración
        RAISE NOTICE 'Migración completada. Registros actualizados: %', 
            (SELECT COUNT(*) FROM barberos WHERE servicios != '[]'::jsonb);
            
        -- Eliminar la columna vieja después de migrar los datos
        ALTER TABLE barberos DROP COLUMN especialidades;
        RAISE NOTICE 'Columna especialidades eliminada';
        
    ELSE
        RAISE NOTICE 'Columna especialidades no encontrada. Creando solo columna servicios.';
    END IF;
END
$$;

-- 3. Comentario en la tabla
COMMENT ON COLUMN barberos.servicios IS 'IDs de servicios que ofrece el barbero (JSON array)';

-- 4. Crear índice para mejorar performance en búsquedas
CREATE INDEX IF NOT EXISTS idx_barberos_servicios ON barberos USING GIN (servicios);

COMMIT;

-- 5. Verificar la migración
DO $$
DECLARE
    reg RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN POST-MIGRACIÓN ===';
    
    -- Mostrar estructura de la tabla
    FOR reg IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'barberos' 
          AND column_name IN ('servicios', 'especialidades')
        ORDER BY column_name
    LOOP
        RAISE NOTICE 'Columna: % | Tipo: % | Nullable: % | Default: %', 
            reg.column_name, reg.data_type, reg.is_nullable, reg.column_default;
    END LOOP;
    
    -- Mostrar algunos datos de ejemplo
    RAISE NOTICE '=== DATOS DE EJEMPLO ===';
    FOR reg IN 
        SELECT id_barbero, servicios 
        FROM barberos 
        LIMIT 3
    LOOP
        RAISE NOTICE 'Barbero ID: % | Servicios: %', reg.id_barbero, reg.servicios;
    END LOOP;
    
    RAISE NOTICE 'Total de barberos: %', (SELECT COUNT(*) FROM barberos);
END
$$;
