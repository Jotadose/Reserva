-- =============================================================================
-- SISTEMA DE RESERVAS - ESQUEMA NORMALIZADO Y ESCALABLE PARA SUPABASE
-- =============================================================================
-- Versión: 1.1 - IDEMPOTENTE
-- Fecha: Agosto 2025
-- Características: Normalización, escalabilidad, migración segura

-- NOTA: Este script es seguro para ejecutar múltiples veces
-- Detecta y respeta estructuras existentes mientras agrega las nuevas

-- =============================================================================
-- VERIFICAR Y HABILITAR EXTENSIONES
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- =============================================================================
-- 1. CREAR TABLAS SOLO SI NO EXISTEN
-- =============================================================================

-- Tabla de servicios (NUEVA ESTRUCTURA NORMALIZADA)
CREATE TABLE IF NOT EXISTS services_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  base_price INTEGER NOT NULL CHECK (base_price >= 0), -- En centavos
  base_duration INTEGER NOT NULL CHECK (base_duration > 0), -- En minutos
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  requires_specialist BOOLEAN DEFAULT FALSE,
  preparation_time INTEGER DEFAULT 0,
  cleanup_time INTEGER DEFAULT 0,
  max_concurrent INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de especialistas/empleados
CREATE TABLE IF NOT EXISTS specialists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  schedule_template JSONB,
  specialties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes normalizada
CREATE TABLE IF NOT EXISTS clients_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  notes TEXT,
  allergies TEXT[],
  preferences JSONB,
  total_visits INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  last_visit DATE,
  client_since DATE DEFAULT CURRENT_DATE,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'premium', 'vip')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal de reservas (NUEVA ESTRUCTURA)
CREATE TABLE IF NOT EXISTS bookings_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  specialist_id UUID,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  scheduled_datetime TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  status TEXT DEFAULT 'confirmed' CHECK (status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'
  )),
  subtotal INTEGER NOT NULL DEFAULT 0,
  taxes INTEGER NOT NULL DEFAULT 0,
  discounts INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  deposit_required INTEGER DEFAULT 0,
  deposit_paid INTEGER DEFAULT 0,
  notes TEXT,
  internal_notes TEXT,
  cancellation_reason TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Servicios incluidos en cada reserva
CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  service_id UUID NOT NULL,
  price INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Especialidades de cada especialista
CREATE TABLE IF NOT EXISTS specialist_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialist_id UUID NOT NULL,
  service_id UUID NOT NULL,
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lista de espera mejorada
CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  flexible_dates BOOLEAN DEFAULT FALSE,
  requested_services UUID[] NOT NULL,
  estimated_duration INTEGER,
  estimated_price INTEGER,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  auto_book BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'contacted', 'booked', 'expired', 'cancelled')),
  notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métodos de pago disponibles
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'card', 'bank_transfer', 'digital_wallet', 'crypto')),
  is_active BOOLEAN DEFAULT TRUE,
  processing_fee_percentage DECIMAL(5,3) DEFAULT 0,
  processing_fee_fixed INTEGER DEFAULT 0,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transacciones de pago
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL,
  payment_method_id UUID NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  processing_fee INTEGER DEFAULT 0,
  net_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'
  )),
  external_transaction_id TEXT,
  gateway_response JSONB,
  description TEXT,
  failure_reason TEXT,
  refund_reason TEXT,
  refunded_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- Sistema de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  client_id UUID,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'booking', 'reminder', 'payment', 'marketing')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] DEFAULT '{"in_app"}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  data JSONB,
  action_url TEXT,
  action_text TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Auditoría y logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuración del sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, key)
);

-- =============================================================================
-- 2. MIGRAR DATOS DE TABLA EXISTENTE (SI EXISTE)
-- =============================================================================

-- Función para migrar datos de bookings existente a la nueva estructura
DO $$
DECLARE
    migration_sql TEXT;
    has_notes_column BOOLEAN;
BEGIN
    -- Verificar si existe la tabla bookings original
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        
        -- Verificar si la nueva estructura está vacía
        IF NOT EXISTS (SELECT 1 FROM bookings_new LIMIT 1) THEN
            
            RAISE NOTICE 'Migrando datos de bookings existente...';
            
            -- Migrar clientes desde bookings
            INSERT INTO clients_new (name, email, phone, created_at)
            SELECT 
                name, 
                email, 
                COALESCE(phone, 'No especificado'),
                MIN(created_at)
            FROM bookings
            WHERE email IS NOT NULL
            GROUP BY name, email, phone
            ON CONFLICT (email) DO NOTHING;
            
            -- Verificar si existe la columna notes
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'bookings' AND column_name = 'notes'
            ) INTO has_notes_column;
            
            -- Construir SQL dinámico para migrar reservas
            migration_sql := '
            INSERT INTO bookings_new (
                client_id, 
                scheduled_date, 
                scheduled_time,
                scheduled_datetime, 
                estimated_duration,
                status,
                subtotal,
                total,
                notes,
                created_at
            )
            SELECT 
                c.id as client_id,
                b.date::date,
                b.time::time,
                (b.date::text || '' '' || b.time::text)::timestamp with time zone,
                COALESCE(b.duration, 45),
                COALESCE(b.status, ''confirmed''),
                COALESCE(
                    CASE 
                        WHEN b.services IS NOT NULL AND jsonb_array_length(b.services) > 0 
                        THEN (
                            SELECT SUM((service->>''price'')::integer * 100) 
                            FROM jsonb_array_elements(b.services) AS service
                        )
                        ELSE 5000
                    END, 
                    5000
                ),
                COALESCE(
                    CASE 
                        WHEN b.services IS NOT NULL AND jsonb_array_length(b.services) > 0 
                        THEN (
                            SELECT SUM((service->>''price'')::integer * 100) 
                            FROM jsonb_array_elements(b.services) AS service
                        )
                        ELSE 5000
                    END, 
                    5000
                ), ' ||
                CASE 
                    WHEN has_notes_column THEN 'COALESCE(b.notes, '''')'
                    ELSE '''''' 
                END || ',
                b.created_at
            FROM bookings b
            JOIN clients_new c ON c.email = b.email
            WHERE b.date IS NOT NULL AND b.time IS NOT NULL';
            
            -- Ejecutar la migración
            EXECUTE migration_sql;
            
            RAISE NOTICE 'Migración completada exitosamente';
        END IF;
    END IF;
END
$$;

-- =============================================================================
-- 3. AGREGAR RESTRICCIONES FORÁNEAS (SOLO SI NO EXISTEN)
-- =============================================================================

-- Función para agregar constraints solo si no existen
DO $$
BEGIN
    -- booking_services -> bookings_new
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'booking_services_booking_id_fkey'
    ) THEN
        ALTER TABLE booking_services 
        ADD CONSTRAINT booking_services_booking_id_fkey 
        FOREIGN KEY (booking_id) REFERENCES bookings_new(id) ON DELETE CASCADE;
    END IF;
    
    -- booking_services -> services_new
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'booking_services_service_id_fkey'
    ) THEN
        ALTER TABLE booking_services 
        ADD CONSTRAINT booking_services_service_id_fkey 
        FOREIGN KEY (service_id) REFERENCES services_new(id) ON DELETE RESTRICT;
    END IF;
    
    -- bookings_new -> clients_new
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_new_client_id_fkey'
    ) THEN
        ALTER TABLE bookings_new 
        ADD CONSTRAINT bookings_new_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients_new(id) ON DELETE RESTRICT;
    END IF;
    
    -- bookings_new -> specialists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_new_specialist_id_fkey'
    ) THEN
        ALTER TABLE bookings_new 
        ADD CONSTRAINT bookings_new_specialist_id_fkey 
        FOREIGN KEY (specialist_id) REFERENCES specialists(id) ON DELETE SET NULL;
    END IF;
    
    -- specialist_services constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'specialist_services_specialist_id_fkey'
    ) THEN
        ALTER TABLE specialist_services 
        ADD CONSTRAINT specialist_services_specialist_id_fkey 
        FOREIGN KEY (specialist_id) REFERENCES specialists(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'specialist_services_service_id_fkey'
    ) THEN
        ALTER TABLE specialist_services 
        ADD CONSTRAINT specialist_services_service_id_fkey 
        FOREIGN KEY (service_id) REFERENCES services_new(id) ON DELETE CASCADE;
    END IF;
    
    -- payments constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_booking_id_fkey'
    ) THEN
        ALTER TABLE payments 
        ADD CONSTRAINT payments_booking_id_fkey 
        FOREIGN KEY (booking_id) REFERENCES bookings_new(id) ON DELETE RESTRICT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payments_payment_method_id_fkey'
    ) THEN
        ALTER TABLE payments 
        ADD CONSTRAINT payments_payment_method_id_fkey 
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE RESTRICT;
    END IF;
    
    -- waiting_list -> clients_new
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'waiting_list_client_id_fkey'
    ) THEN
        ALTER TABLE waiting_list 
        ADD CONSTRAINT waiting_list_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients_new(id) ON DELETE SET NULL;
    END IF;
    
    -- notifications -> clients_new
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_client_id_fkey'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients_new(id) ON DELETE CASCADE;
    END IF;
    
    -- Unique constraints
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'booking_services_unique'
    ) THEN
        ALTER TABLE booking_services 
        ADD CONSTRAINT booking_services_unique 
        UNIQUE(booking_id, service_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'specialist_services_unique'
    ) THEN
        ALTER TABLE specialist_services 
        ADD CONSTRAINT specialist_services_unique 
        UNIQUE(specialist_id, service_id);
    END IF;
    
END
$$;

-- =============================================================================
-- 4. CREAR ÍNDICES (SOLO SI NO EXISTEN)
-- =============================================================================

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_new_client_id ON bookings_new(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_new_specialist_id ON bookings_new(specialist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_new_scheduled_datetime ON bookings_new(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_new_status ON bookings_new(status);
CREATE INDEX IF NOT EXISTS idx_bookings_new_date_status ON bookings_new(scheduled_date, status);

-- Booking Services
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id ON booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_services_service_id ON booking_services(service_id);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_new_email ON clients_new(email);
CREATE INDEX IF NOT EXISTS idx_clients_new_phone ON clients_new(phone);
CREATE INDEX IF NOT EXISTS idx_clients_new_status ON clients_new(status);
CREATE INDEX IF NOT EXISTS idx_clients_new_tier ON clients_new(tier);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- 5. CREAR TRIGGERS Y FUNCIONES
-- =============================================================================

-- Función para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para sincronizar scheduled_datetime
CREATE OR REPLACE FUNCTION update_scheduled_datetime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.scheduled_datetime = (NEW.scheduled_date::text || ' ' || NEW.scheduled_time::text)::timestamp with time zone;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at (solo si no existen)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_new_scheduled_datetime') THEN
        CREATE TRIGGER update_bookings_new_scheduled_datetime 
        BEFORE INSERT OR UPDATE ON bookings_new 
        FOR EACH ROW EXECUTE FUNCTION update_scheduled_datetime();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_new_updated_at') THEN
        CREATE TRIGGER update_bookings_new_updated_at 
        BEFORE UPDATE ON bookings_new 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_new_updated_at') THEN
        CREATE TRIGGER update_clients_new_updated_at 
        BEFORE UPDATE ON clients_new 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_services_new_updated_at') THEN
        CREATE TRIGGER update_services_new_updated_at 
        BEFORE UPDATE ON services_new 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_specialists_updated_at') THEN
        CREATE TRIGGER update_specialists_updated_at 
        BEFORE UPDATE ON specialists 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_waiting_list_updated_at') THEN
        CREATE TRIGGER update_waiting_list_updated_at 
        BEFORE UPDATE ON waiting_list 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Función para calcular totales de reserva
CREATE OR REPLACE FUNCTION calculate_booking_totals()
RETURNS TRIGGER AS $$
DECLARE
    total_price INTEGER := 0;
    total_duration INTEGER := 0;
BEGIN
    SELECT 
        COALESCE(SUM(price), 0),
        COALESCE(SUM(duration), 0)
    INTO total_price, total_duration
    FROM booking_services 
    WHERE booking_id = COALESCE(NEW.booking_id, OLD.booking_id);
    
    UPDATE bookings_new 
    SET 
        subtotal = total_price,
        total = total_price + COALESCE(taxes, 0) - COALESCE(discounts, 0),
        estimated_duration = total_duration,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.booking_id, OLD.booking_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger para calcular totales (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'calculate_booking_totals_trigger') THEN
        CREATE TRIGGER calculate_booking_totals_trigger
        AFTER INSERT OR UPDATE OR DELETE ON booking_services
        FOR EACH ROW EXECUTE FUNCTION calculate_booking_totals();
    END IF;
END
$$;

-- =============================================================================
-- 6. FUNCIONES DE NEGOCIO
-- =============================================================================

-- Función para obtener disponibilidad de horarios
CREATE OR REPLACE FUNCTION get_available_slots(
    p_date DATE,
    p_specialist_id UUID DEFAULT NULL,
    p_duration INTEGER DEFAULT 60
) RETURNS TABLE(
    slot_time TIME,
    available_specialists UUID[]
) AS $$
DECLARE
    slot_start TIME;
    slot_end TIME;
    business_start TIME := '09:00';
    business_end TIME := '18:00';
    slot_interval INTEGER := 30;
BEGIN
    slot_start := business_start;
    
    WHILE slot_start + (p_duration || ' minutes')::interval <= business_end::time LOOP
        slot_end := slot_start + (p_duration || ' minutes')::interval;
        
        slot_time := slot_start;
        available_specialists := ARRAY(
            SELECT s.id 
            FROM specialists s
            WHERE s.is_active = TRUE
            AND (p_specialist_id IS NULL OR s.id = p_specialist_id)
            AND NOT EXISTS (
                SELECT 1 FROM bookings_new b
                WHERE b.specialist_id = s.id
                AND b.scheduled_date = p_date
                AND b.status NOT IN ('cancelled', 'no_show')
                AND tstzrange(
                    (p_date::text || ' ' || b.scheduled_time::text)::timestamp,
                    (p_date::text || ' ' || b.scheduled_time::text)::timestamp + (b.estimated_duration || ' minutes')::interval
                ) && tstzrange(
                    (p_date::text || ' ' || slot_start::text)::timestamp,
                    (p_date::text || ' ' || slot_end::text)::timestamp
                )
            )
        );
        
        RETURN NEXT;
        slot_start := slot_start + (slot_interval || ' minutes')::interval;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular métricas de cliente
CREATE OR REPLACE FUNCTION update_client_metrics(p_client_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE clients_new SET
        total_visits = (
            SELECT COUNT(*) 
            FROM bookings_new 
            WHERE client_id = p_client_id 
            AND status = 'completed'
        ),
        total_spent = (
            SELECT COALESCE(SUM(total), 0) 
            FROM bookings_new 
            WHERE client_id = p_client_id 
            AND status = 'completed'
        ),
        last_visit = (
            SELECT MAX(scheduled_date) 
            FROM bookings_new 
            WHERE client_id = p_client_id 
            AND status = 'completed'
        ),
        tier = CASE 
            WHEN (SELECT COALESCE(SUM(total), 0) FROM bookings_new WHERE client_id = p_client_id AND status = 'completed') >= 500000 THEN 'vip'
            WHEN (SELECT COALESCE(SUM(total), 0) FROM bookings_new WHERE client_id = p_client_id AND status = 'completed') >= 200000 THEN 'premium'
            ELSE 'standard'
        END,
        updated_at = NOW()
    WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 7. INSERTAR DATOS INICIALES (SOLO SI NO EXISTEN)
-- =============================================================================

-- Métodos de pago básicos
INSERT INTO payment_methods (name, type, is_active, processing_fee_percentage, config)
SELECT 'Efectivo', 'cash', true, 0, '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Efectivo');

INSERT INTO payment_methods (name, type, is_active, processing_fee_percentage, config)
SELECT 'Tarjeta de Crédito/Débito', 'card', true, 2.9, '{"gateway": "wompi"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Tarjeta de Crédito/Débito');

INSERT INTO payment_methods (name, type, is_active, processing_fee_percentage, config)
SELECT 'Transferencia Bancaria', 'bank_transfer', true, 0.5, '{"banks": ["bancolombia", "davivienda", "bbva"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Transferencia Bancaria');

INSERT INTO payment_methods (name, type, is_active, processing_fee_percentage, config)
SELECT 'Nequi', 'digital_wallet', true, 2.0, '{"max_amount": 2000000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Nequi');

INSERT INTO payment_methods (name, type, is_active, processing_fee_percentage, config)
SELECT 'Daviplata', 'digital_wallet', true, 2.0, '{"max_amount": 1500000}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Daviplata');

-- Configuraciones del sistema
INSERT INTO system_settings (category, key, value, description, is_public)
SELECT 'business', 'name', '"Barber Studio Premium"'::jsonb, 'Nombre del negocio', true
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE category = 'business' AND key = 'name');

INSERT INTO system_settings (category, key, value, description, is_public)
SELECT 'business', 'phone', '"+57 300 123 4567"'::jsonb, 'Teléfono principal', true
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE category = 'business' AND key = 'phone');

INSERT INTO system_settings (category, key, value, description, is_public)
SELECT 'booking', 'advance_booking_days', '30'::jsonb, 'Días máximos para reservar con anticipación', true
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE category = 'booking' AND key = 'advance_booking_days');

INSERT INTO system_settings (category, key, value, description, is_public)
SELECT 'booking', 'cancellation_hours', '24'::jsonb, 'Horas mínimas para cancelar sin penalización', true
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE category = 'booking' AND key = 'cancellation_hours');

-- =============================================================================
-- 8. CREAR VISTAS PARA COMPATIBILIDAD (OPCIONAL)
-- =============================================================================

-- Vista que mantiene compatibilidad con queries existentes
-- Nota: Se usa DROP VIEW si existe para manejar conflictos con tabla existente
DO $$
BEGIN
    -- Intentar eliminar la vista si existe
    BEGIN
        DROP VIEW IF EXISTS bookings_view CASCADE;
    EXCEPTION WHEN OTHERS THEN
        -- Ignorar errores si no se puede eliminar
        NULL;
    END;
END
$$;

-- Crear vista de compatibilidad con nombre alternativo
CREATE OR REPLACE VIEW bookings_view AS
SELECT 
    b.id,
    c.name,
    c.email,
    c.phone,
    b.scheduled_date as date,
    b.scheduled_time as time,
    b.status,
    b.estimated_duration as duration,
    COALESCE(
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'name', s.name,
                'price', bs.price::float / 100,
                'duration', bs.duration
            )
        )
        FROM booking_services bs
        JOIN services_new s ON s.id = bs.service_id
        WHERE bs.booking_id = b.id),
        '[]'::jsonb
    ) as services,
    b.notes,
    b.created_at
FROM bookings_new b
JOIN clients_new c ON c.id = b.client_id;

-- =============================================================================
-- FINALIZACIÓN
-- =============================================================================

-- Mostrar resumen de la migración
DO $$
DECLARE
    services_count INTEGER;
    clients_count INTEGER;
    bookings_count INTEGER;
    specialists_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO services_count FROM services_new;
    SELECT COUNT(*) INTO clients_count FROM clients_new;
    SELECT COUNT(*) INTO bookings_count FROM bookings_new;
    SELECT COUNT(*) INTO specialists_count FROM specialists;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Servicios: %', services_count;
    RAISE NOTICE 'Clientes: %', clients_count;
    RAISE NOTICE 'Reservas: %', bookings_count;
    RAISE NOTICE 'Especialistas: %', specialists_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Las tablas originales se mantienen intactas';
    RAISE NOTICE 'Las nuevas tablas tienen sufijo "_new"';
    RAISE NOTICE 'Vista "bookings_view" creada para compatibilidad';
    RAISE NOTICE 'Para usar la nueva estructura, consulte las tablas "_new"';
    RAISE NOTICE '========================================';
END
$$;
