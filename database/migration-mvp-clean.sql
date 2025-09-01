-- MIGRACION COMPLETA A ESQUEMA MVP - DESDE CERO
-- Este script elimina las tablas actuales e implementa el esquema completo
-- ADVERTENCIA: Esto eliminara TODOS los datos existentes

-- PASO 1: LIMPIAR ESQUEMA EXISTENTE

-- Deshabilitar foreign key checks temporalmente
SET session_replication_role = replica;

-- Eliminar tablas existentes en orden correcto
DROP TABLE IF EXISTS barber_schedules CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS specialists CASCADE;

-- Eliminar secuencias si existen
DROP SEQUENCE IF EXISTS bookings_id_seq CASCADE;

-- Rehabilitar foreign key checks
SET session_replication_role = DEFAULT;

-- PASO 2: HABILITAR EXTENSIONES NECESARIAS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- PASO 3: CREAR ESQUEMA MVP COMPLETO

-- Tabla de usuarios (base para todos los roles)
CREATE TABLE usuarios (
  id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rol TEXT NOT NULL CHECK (rol IN ('cliente', 'barbero', 'admin')),
  activo BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  configuracion JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de servicios
CREATE TABLE servicios (
  id_servicio UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio INTEGER NOT NULL CHECK (precio >= 0),
  duracion INTEGER NOT NULL CHECK (duracion > 0),
  categoria TEXT,
  activo BOOLEAN DEFAULT TRUE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de barberos (extiende usuarios)
CREATE TABLE barberos (
  id_barbero UUID PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  especialidades TEXT[],
  horario_inicio TIME DEFAULT '09:00',
  horario_fin TIME DEFAULT '18:00',
  dias_trabajo TEXT[] DEFAULT ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
  tiempo_descanso INTEGER DEFAULT 10,
  activo BOOLEAN DEFAULT TRUE,
  biografia TEXT,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  total_cortes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de disponibilidad de barberos
CREATE TABLE disponibilidad (
  id_disponibilidad UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_barbero UUID NOT NULL REFERENCES barberos(id_barbero) ON DELETE CASCADE,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('trabajo', 'descanso', 'vacaciones', 'bloqueado')),
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas (normalizada)
CREATE TABLE reservas (
  id_reserva UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_cliente UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  id_barbero UUID NOT NULL REFERENCES barberos(id_barbero) ON DELETE RESTRICT,
  id_servicio UUID NOT NULL REFERENCES servicios(id_servicio) ON DELETE RESTRICT,
  fecha_reserva DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  precio_total INTEGER NOT NULL CHECK (precio_total >= 0),
  estado TEXT DEFAULT 'confirmada' CHECK (estado IN (
    'pendiente', 
    'confirmada', 
    'en_progreso', 
    'completada', 
    'cancelada', 
    'no_show'
  )),
  notas_cliente TEXT,
  notas_internas TEXT,
  motivo_cancelacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmada_at TIMESTAMP WITH TIME ZONE,
  completada_at TIMESTAMP WITH TIME ZONE,
  cancelada_at TIMESTAMP WITH TIME ZONE
);

-- PASO 4: INDICES PARA RENDIMIENTO

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_barberos_activo ON barberos(activo);
CREATE INDEX idx_disponibilidad_barbero ON disponibilidad(id_barbero);
CREATE INDEX idx_disponibilidad_fecha ON disponibilidad(fecha_inicio, fecha_fin);
CREATE INDEX idx_disponibilidad_tipo ON disponibilidad(tipo);
CREATE INDEX idx_reservas_cliente ON reservas(id_cliente);
CREATE INDEX idx_reservas_barbero ON reservas(id_barbero);
CREATE INDEX idx_reservas_servicio ON reservas(id_servicio);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX idx_reservas_fecha_hora ON reservas(fecha_reserva, hora_inicio);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_servicios_activo ON servicios(activo);
CREATE INDEX idx_servicios_categoria ON servicios(categoria);

-- PASO 5: RESTRICCIONES DE INTEGRIDAD

-- Primero crear la funcion auxiliar
CREATE OR REPLACE FUNCTION crear_timestamp_simple(fecha DATE, hora TIME)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN (fecha::text || ' ' || hora::text)::timestamp with time zone;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

ALTER TABLE reservas ADD CONSTRAINT reservas_no_overlap 
EXCLUDE USING GIST (
  id_barbero WITH =,
  tstzrange(
    crear_timestamp_simple(fecha_reserva, hora_inicio),
    crear_timestamp_simple(fecha_reserva, hora_fin)
  ) WITH &&
) WHERE (estado NOT IN ('cancelada', 'no_show'));

ALTER TABLE reservas ADD CONSTRAINT reservas_horas_logicas 
CHECK (hora_fin > hora_inicio);

ALTER TABLE reservas ADD CONSTRAINT reservas_duracion_coherente
CHECK (duracion_minutos = EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) / 60);

-- PASO 6: TRIGGERS AUTOMATICOS

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_updated_at 
  BEFORE UPDATE ON usuarios FOR EACH ROW 
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_servicios_updated_at 
  BEFORE UPDATE ON servicios FOR EACH ROW 
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_barberos_updated_at 
  BEFORE UPDATE ON barberos FOR EACH ROW 
  EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trigger_reservas_updated_at 
  BEFORE UPDATE ON reservas FOR EACH ROW 
  EXECUTE FUNCTION actualizar_updated_at();

CREATE OR REPLACE FUNCTION actualizar_metricas_barbero()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'completada' AND OLD.estado != 'completada' THEN
        UPDATE barberos 
        SET 
            total_cortes = total_cortes + 1,
            updated_at = NOW()
        WHERE id_barbero = NEW.id_barbero;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_metricas_barbero
  AFTER UPDATE ON reservas FOR EACH ROW
  EXECUTE FUNCTION actualizar_metricas_barbero();

-- PASO 7: FUNCIONES UTILES PARA EL MVP

CREATE OR REPLACE FUNCTION obtener_slots_disponibles(
    p_id_barbero UUID,
    p_fecha DATE,
    p_duracion INTEGER DEFAULT 60
) RETURNS TABLE(
    hora_inicio TIME,
    hora_fin TIME,
    disponible BOOLEAN
) AS $$
DECLARE
    horario_inicio TIME;
    horario_fin TIME;
    slot_actual TIME;
    slot_siguiente TIME;
    intervalo INTEGER := 30;
BEGIN
    SELECT b.horario_inicio, b.horario_fin 
    INTO horario_inicio, horario_fin
    FROM barberos b 
    WHERE b.id_barbero = p_id_barbero AND b.activo = TRUE;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    slot_actual := horario_inicio;
    
    WHILE slot_actual + (p_duracion || ' minutes')::interval <= horario_fin LOOP
        slot_siguiente := slot_actual + (p_duracion || ' minutes')::interval;
        
        hora_inicio := slot_actual;
        hora_fin := slot_siguiente;
        
        disponible := NOT EXISTS (
            SELECT 1 FROM reservas r
            WHERE r.id_barbero = p_id_barbero
            AND r.fecha_reserva = p_fecha
            AND r.estado NOT IN ('cancelada', 'no_show')
            AND tstzrange(
                crear_timestamp_simple(r.fecha_reserva, r.hora_inicio),
                crear_timestamp_simple(r.fecha_reserva, r.hora_fin)
            ) && tstzrange(
                crear_timestamp_simple(p_fecha, slot_actual),
                crear_timestamp_simple(p_fecha, slot_siguiente)
            )
        ) AND NOT EXISTS (
            SELECT 1 FROM disponibilidad d
            WHERE d.id_barbero = p_id_barbero
            AND d.tipo IN ('descanso', 'vacaciones', 'bloqueado')
            AND tstzrange(d.fecha_inicio, d.fecha_fin) && tstzrange(
                crear_timestamp_simple(p_fecha, slot_actual),
                crear_timestamp_simple(p_fecha, slot_siguiente)
            )
        );
        
        RETURN NEXT;
        slot_actual := slot_actual + (intervalo || ' minutes')::interval;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- PASO 8: DATOS INICIALES DEL MVP

INSERT INTO usuarios (id_usuario, nombre, email, telefono, rol) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Administrador', 'admin@barbershop.com', '+57 300 1234567', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodriguez', 'carlos@barbershop.com', '+57 300 1234568', 'barbero'),
('550e8400-e29b-41d4-a716-446655440003', 'Miguel Gonzalez', 'miguel@barbershop.com', '+57 300 1234569', 'barbero'),
('550e8400-e29b-41d4-a716-446655440004', 'Andres Lopez', 'andres@barbershop.com', '+57 300 1234570', 'barbero'),
('550e8400-e29b-41d4-a716-446655440005', 'David Martinez', 'david@barbershop.com', '+57 300 1234571', 'barbero'),
('550e8400-e29b-41d4-a716-446655440006', 'Juan Perez', 'juan@email.com', '+57 300 1111111', 'cliente'),
('550e8400-e29b-41d4-a716-446655440007', 'Ana Garcia', 'ana@email.com', '+57 300 2222222', 'cliente');

INSERT INTO barberos (id_barbero, especialidades, biografia, horario_inicio, horario_fin) VALUES
('550e8400-e29b-41d4-a716-446655440002', ARRAY['corte', 'barba', 'afeitado'], 'Especialista en cortes clasicos y modernos. 15 anos de experiencia.', '09:00', '18:00'),
('550e8400-e29b-41d4-a716-446655440003', ARRAY['corte', 'coloracion', 'styling'], 'Experto en tendencias y coloracion. Formacion internacional.', '10:00', '19:00'),
('550e8400-e29b-41d4-a716-446655440004', ARRAY['barba', 'bigote', 'afeitado_tradicional'], 'Maestro del afeitado tradicional con navaja.', '08:00', '17:00'),
('550e8400-e29b-41d4-a716-446655440005', ARRAY['corte', 'barba', 'diseno'], 'Especialista en disenos creativos y cortes de precision.', '11:00', '20:00');

INSERT INTO servicios (id_servicio, nombre, descripcion, precio, duracion, categoria, color) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Corte Basico', 'Corte de cabello tradicional', 2500000, 30, 'corte', '#3B82F6'),
('660e8400-e29b-41d4-a716-446655440002', 'Corte Premium', 'Corte moderno con styling', 4000000, 45, 'corte', '#8B5CF6'),
('660e8400-e29b-41d4-a716-446655440003', 'Arreglo de Barba', 'Perfilado y arreglo de barba', 2000000, 20, 'barba', '#10B981'),
('660e8400-e29b-41d4-a716-446655440004', 'Barba Completa', 'Corte y diseno completo de barba', 3500000, 35, 'barba', '#F59E0B'),
('660e8400-e29b-41d4-a716-446655440005', 'Afeitado Tradicional', 'Afeitado con navaja y toalla caliente', 3000000, 40, 'afeitado', '#EF4444'),
('660e8400-e29b-41d4-a716-446655440006', 'Combo Completo', 'Corte + Barba + Afeitado', 6000000, 75, 'combo', '#6366F1');

INSERT INTO reservas (id_cliente, id_barbero, id_servicio, fecha_reserva, hora_inicio, hora_fin, duracion_minutos, precio_total, estado) VALUES
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '10:00', '10:30', 30, 2500000, 'confirmada'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, '14:00', '14:45', 45, 4000000, 'confirmada'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005', CURRENT_DATE + 1, '09:00', '09:40', 40, 3000000, 'confirmada');

-- VERIFICACION FINAL

SELECT 'Migracion completada exitosamente' as mensaje,
       (SELECT COUNT(*) FROM usuarios) as total_usuarios,
       (SELECT COUNT(*) FROM barberos WHERE activo = true) as barberos_activos,
       (SELECT COUNT(*) FROM servicios WHERE activo = true) as servicios_disponibles,
       (SELECT COUNT(*) FROM reservas) as reservas_ejemplo;
