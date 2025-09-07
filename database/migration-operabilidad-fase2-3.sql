-- =============================================================
-- MIGRACIÓN OPERABILIDAD & ANALÍTICA (FASES 2 y 3)
-- Fecha: 2025-09-03
-- Objetivo: soporte de soft delete, bloqueos, auditoría, comisiones,
--           lista de espera, notificaciones y esqueleto de métricas.
-- NOTA: Adaptada al esquema actual provisto (barberos, disponibilidad,
--        reservas, servicios, usuarios). Usa uuid_generate_v4() para
--        consistencia con claves existentes. Incluye pasos idempotentes.
-- =============================================================

-- 0. Extensiones requeridas (idempotentes)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- para uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- opcional (gen_random_uuid())

-- 1. Soft delete en reservas
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. Campos de auditoría opcionales (si no existen)
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS confirmada_at timestamptz,
  ADD COLUMN IF NOT EXISTS completada_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelada_at timestamptz,
  ADD COLUMN IF NOT EXISTS motivo_cancelacion text;

-- 3. Comisión en barberos (porcentaje base global)
ALTER TABLE barberos
  ADD COLUMN IF NOT EXISTS comision_base numeric(5,2) DEFAULT 0;

-- 4. Tabla de bloqueos y vacaciones unificada
CREATE TABLE IF NOT EXISTS bloqueos_horarios (
  id_bloqueo uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_barbero uuid NULL REFERENCES barberos(id_barbero) ON DELETE CASCADE,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  hora_inicio time NULL,
  hora_fin time NULL,
  tipo text NOT NULL CHECK (tipo IN ('vacaciones','bloqueo','mantenimiento','capacitacion','otro')),
  motivo text,
  metadata jsonb DEFAULT '{}'::jsonb,
  creado_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bloqueos_barbero_rango ON bloqueos_horarios(id_barbero, fecha_inicio, fecha_fin);

-- 4.a Migrar datos existentes desde tabla "disponibilidad" para tipos aplicables
INSERT INTO bloqueos_horarios (id_barbero, fecha_inicio, fecha_fin, tipo, motivo, metadata)
SELECT d.id_barbero,
       d.fecha_inicio::date,
       d.fecha_fin::date,
       CASE d.tipo WHEN 'vacaciones' THEN 'vacaciones' ELSE 'bloqueo' END AS tipo,
       COALESCE(d.descripcion, 'migrado_disponibilidad') AS motivo,
       jsonb_build_object('origen','disponibilidad','id_disponibilidad', d.id_disponibilidad)
FROM disponibilidad d
LEFT JOIN bloqueos_horarios b
  ON b.id_barbero = d.id_barbero
 AND b.fecha_inicio = d.fecha_inicio::date
 AND b.fecha_fin = d.fecha_fin::date
WHERE d.tipo IN ('vacaciones','bloqueado')
  AND b.id_bloqueo IS NULL;

-- 5. Tabla de auditoría mínima
CREATE TABLE IF NOT EXISTS event_log (
  id_evento bigserial PRIMARY KEY,
  actor text NULL,
  entidad text NOT NULL,
  accion text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  creado_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_log_entidad ON event_log(entidad, accion);

-- 6. Lista de espera
CREATE TABLE IF NOT EXISTS waitlist (
  id_waitlist bigserial PRIMARY KEY,
  id_cliente uuid NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_servicio uuid NULL REFERENCES servicios(id_servicio),
  id_barbero uuid NULL REFERENCES barberos(id_barbero),
  fecha_deseada date NULL,
  duracion_minutos int NULL,
  prioridad int DEFAULT 0,
  estado text NOT NULL DEFAULT 'activa', -- activa | asignada | expirada | cancelada
  creado_at timestamptz DEFAULT now(),
  asignada_at timestamptz NULL
);
CREATE INDEX IF NOT EXISTS idx_waitlist_estado ON waitlist(estado, prioridad);

-- 7. Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id_notificacion bigserial PRIMARY KEY,
  canal text NOT NULL, -- email | sms | push | interno
  destinatario text NOT NULL,
  template text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  estado text NOT NULL DEFAULT 'pendiente', -- pendiente | enviado | error
  intentos int DEFAULT 0,
  ultimo_intento timestamptz NULL,
  creado_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_estado ON notifications(estado, creado_at);

-- 8. Vista materializada (ejemplo base) para métricas financieras
DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_metricas_financieras'
  ) THEN
    EXECUTE $mv$CREATE MATERIALIZED VIEW mv_metricas_financieras AS
      SELECT
        date_trunc('month', fecha_reserva)::date AS periodo_mes,
        id_barbero,
        count(*) FILTER (WHERE estado = 'completada') AS reservas_completadas,
        sum(precio_total) FILTER (WHERE estado = 'completada') AS ingresos_brutos,
        count(*) FILTER (WHERE estado = 'no_show') AS no_shows,
        count(*) FILTER (WHERE estado = 'cancelada') AS canceladas
      FROM reservas
      WHERE deleted_at IS NULL
      GROUP BY 1,2$mv$;
  END IF;
END
$body$;

-- Índice para refresco rápido
CREATE INDEX IF NOT EXISTS idx_mv_metricas_financieras_barbero_mes ON mv_metricas_financieras(id_barbero, periodo_mes);

-- 9. Función para refrescar vista (manual / job externo)
CREATE OR REPLACE FUNCTION refresh_mv_metricas_financieras()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM 1 FROM pg_matviews WHERE matviewname = 'mv_metricas_financieras';
  IF FOUND THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metricas_financieras;
  END IF;
END;$$;

-- 10. Comentarios finales
-- - Añadir triggers futuros para auto-log en event_log si se requiere.
-- - Métricas extendidas (recurrencia, asistencia) pueden añadirse con más columnas y otra MV.
-- - Consolidar gradualmente lógica de 'disponibilidad' hacia 'bloqueos_horarios'.
