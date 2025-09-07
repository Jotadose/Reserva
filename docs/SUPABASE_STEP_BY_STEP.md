# Supabase - Paso a Paso (Operabilidad & Analítica)

Guía breve para reproducir / mantener los cambios estructurales de fases 2 y 3.

## 1. Extensiones necesarias

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- opcional
```

## 2. Soft Delete y Auditoría

```sql
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE TABLE IF NOT EXISTS event_log (
  id_evento bigserial PRIMARY KEY,
  actor text NULL,
  entidad text NOT NULL,
  accion text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  creado_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_log_entidad ON event_log(entidad, accion);
```

## 3. Bloqueos / Vacaciones

```sql
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
```

Migración desde tabla `disponibilidad` (solo tipos vacaciones / bloqueado):

```sql
INSERT INTO bloqueos_horarios (id_barbero, fecha_inicio, fecha_fin, tipo, motivo, metadata)
SELECT d.id_barbero,
       d.fecha_inicio::date,
       d.fecha_fin::date,
       CASE d.tipo WHEN 'vacaciones' THEN 'vacaciones' ELSE 'bloqueo' END,
       COALESCE(d.descripcion,'migrado_disponibilidad'),
       jsonb_build_object('origen','disponibilidad','id_disponibilidad', d.id_disponibilidad)
FROM disponibilidad d
LEFT JOIN bloqueos_horarios b
  ON b.id_barbero = d.id_barbero
 AND b.fecha_inicio = d.fecha_inicio::date
 AND b.fecha_fin = d.fecha_fin::date
WHERE d.tipo IN ('vacaciones','bloqueado')
  AND b.id_bloqueo IS NULL;
```

## 4. Lista de Espera y Notificaciones

```sql
CREATE TABLE IF NOT EXISTS waitlist (...);
CREATE INDEX IF NOT EXISTS idx_waitlist_estado ON waitlist(estado, prioridad);
CREATE TABLE IF NOT EXISTS notifications (...);
CREATE INDEX IF NOT EXISTS idx_notifications_estado ON notifications(estado, creado_at);
```

## 5. Métricas Materializadas

Materialized view básica:

```sql
CREATE MATERIALIZED VIEW mv_metricas_financieras AS
SELECT date_trunc('month', fecha_reserva)::date AS periodo_mes,
       id_barbero,
       count(*) FILTER (WHERE estado = 'completada') AS reservas_completadas,
       sum(precio_total) FILTER (WHERE estado = 'completada') AS ingresos_brutos,
       count(*) FILTER (WHERE estado = 'no_show') AS no_shows,
       count(*) FILTER (WHERE estado = 'cancelada') AS canceladas
FROM reservas
WHERE deleted_at IS NULL
GROUP BY 1,2;
```

Refresco seguro:

```sql
CREATE OR REPLACE FUNCTION refresh_mv_metricas_financieras()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM 1 FROM pg_matviews WHERE matviewname = 'mv_metricas_financieras';
  IF FOUND THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_metricas_financieras;
  END IF;
END;$$;
```

## 6. Índices Recomendados Adicionales

```sql
-- Consultas por barbero / fecha / estado (excluye soft deleted)
CREATE INDEX IF NOT EXISTS idx_reservas_barbero_fecha_estado
  ON reservas(id_barbero, fecha_reserva, estado) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_notifications_pick ON notifications(estado, intentos, creado_at);
```

## 7. (Opcional) Constraint anti solape

```sql
ALTER TABLE reservas
  ADD COLUMN IF NOT EXISTS ts_range tstzrange;

UPDATE reservas
SET ts_range = tstzrange(
  (fecha_reserva::text || ' ' || hora_inicio)::timestamptz,
  (fecha_reserva::text || ' ' || hora_fin)::timestamptz,
  '[)'
)
WHERE ts_range IS NULL;

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE reservas ADD CONSTRAINT reservas_no_overlap
  EXCLUDE USING gist (id_barbero WITH =, ts_range WITH &&)
  WHERE (deleted_at IS NULL);
```

Trigger para mantener ts_range (esquema ejemplo, ajustar naming):

```sql
CREATE OR REPLACE FUNCTION set_reserva_ts_range()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.ts_range = tstzrange(
    (NEW.fecha_reserva::text || ' ' || NEW.hora_inicio)::timestamptz,
    (NEW.fecha_reserva::text || ' ' || NEW.hora_fin)::timestamptz,
    '[)'
  );
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS tr_reservas_ts_range ON reservas;
CREATE TRIGGER tr_reservas_ts_range
  BEFORE INSERT OR UPDATE OF fecha_reserva, hora_inicio, hora_fin ON reservas
  FOR EACH ROW EXECUTE FUNCTION set_reserva_ts_range();
```

## 8. Timestamps de estado automáticos (ejemplo)

```sql
CREATE OR REPLACE FUNCTION set_estado_timestamps()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.estado = 'confirmada' AND OLD.estado IS DISTINCT FROM 'confirmada' AND NEW.confirmada_at IS NULL THEN
      NEW.confirmada_at = now();
    END IF;
    IF NEW.estado = 'completada' AND OLD.estado IS DISTINCT FROM 'completada' AND NEW.completada_at IS NULL THEN
      NEW.completada_at = now();
    END IF;
    IF NEW.estado = 'cancelada' AND OLD.estado IS DISTINCT FROM 'cancelada' AND NEW.cancelada_at IS NULL THEN
      NEW.cancelada_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS tr_reservas_estado_ts ON reservas;
CREATE TRIGGER tr_reservas_estado_ts
  BEFORE UPDATE OF estado ON reservas
  FOR EACH ROW EXECUTE FUNCTION set_estado_timestamps();
```

## 9. Próximos pasos sugeridos

1. Integrar bloqueos en generación de slots server-side.
2. Extender MV con asistencia (%) y recurrencia clientes.
3. Implementar worker de notificaciones (estado → enviado/error + retries).
4. Auto-asignación waitlist al liberar / cancelar reserva.
5. Caducidad / limpieza event_log (retención).

---

Documentado para referencia operativa rápida.
