-- =============================================================
-- MIGRACIÓN MVP MULTI-SERVICIO
-- Fecha: 2025-09-04
-- Objetivo: soporte rápido para reservas con múltiples servicios
-- Estrategia: mantener id_servicio (servicio primario) y almacenar
--             el conjunto completo en columna JSONB servicios_json.
--             Calcular duración y precio total en backend.
--             Asegurar unicidad (id_barbero, fecha_reserva, hora_inicio).
-- Reversible: eliminar columna servicios_json si se quisiera rollback.
-- =============================================================

-- 1. Columna JSON para lista de servicios seleccionados
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS servicios_json jsonb DEFAULT '[]'::jsonb;

-- 2. Índice GIN opcional para consultas futuras (por ejemplo, filtrar por servicio contenido)
CREATE INDEX IF NOT EXISTS idx_reservas_servicios_json_gin ON reservas USING GIN (servicios_json jsonb_path_ops);

-- 3. Constraint de unicidad para prevenir doble booking mismo barbero / slot
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_reservas_barbero_fecha_horainicio'
  ) THEN
    ALTER TABLE reservas
      ADD CONSTRAINT uq_reservas_barbero_fecha_horainicio
      UNIQUE (id_barbero, fecha_reserva, hora_inicio)
      DEFERRABLE INITIALLY IMMEDIATE;
  END IF;
END$$;

-- 4. Comentario explicativo
COMMENT ON COLUMN reservas.servicios_json IS 'Array de servicios de la reserva: [{"id_servicio":"uuid","duracion":int,"precio":int}]';

-- 5. (Opcional futuro) Tabla puente formal reservas_servicios si se requiere reporting relacional.
--    Este MVP usa JSON para menor complejidad inicial.
