-- Migración: Cambiar columna "especialidades" por "servicios" en tabla barberos
-- Ejecutar en Supabase SQL Editor

BEGIN;

-- 1. Agregar nueva columna "servicios" (JSON array)
ALTER TABLE barberos 
ADD COLUMN IF NOT EXISTS servicios JSONB DEFAULT '[]'::jsonb;

-- 2. Migrar datos de "especialidades" a "servicios" (si la columna existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'barberos' AND column_name = 'especialidades'
  ) THEN
    -- Convertir array de texto a JSONB array
    UPDATE barberos 
    SET servicios = CASE 
      WHEN especialidades IS NULL THEN '[]'::jsonb
      WHEN array_length(especialidades, 1) IS NULL THEN '[]'::jsonb
      ELSE to_jsonb(especialidades)
    END
    WHERE servicios = '[]'::jsonb OR servicios IS NULL;
    
    -- Eliminar la columna vieja después de migrar los datos
    ALTER TABLE barberos DROP COLUMN IF EXISTS especialidades;
  END IF;
END
$$;

-- 3. Comentario en la tabla
COMMENT ON COLUMN barberos.servicios IS 'IDs de servicios que ofrece el barbero (JSON array)';

COMMIT;

-- Verificar la migración
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'barberos' 
  AND column_name IN ('servicios', 'especialidades')
ORDER BY column_name;
