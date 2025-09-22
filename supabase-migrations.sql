-- =============================================================================
-- AGENDEX SAAS - MIGRACIONES DE BASE DE DATOS PARA SUPABASE
-- =============================================================================
-- Ejecuta este script en el editor SQL de tu proyecto Supabase
-- para crear todas las tablas necesarias para Agendex

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLA: tenants (Barberías/Negocios)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND length(slug) >= 3),
    name text NOT NULL,
    description text,
    category text,
    address text,
    contact_phone text,
    contact_email text,
    website text,
    instagram text,
    whatsapp text,
    working_hours jsonb DEFAULT '{}',
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
    subscription_plan text DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    slot_duration_minutes integer DEFAULT 30,
    settings jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para tenants
CREATE INDEX IF NOT EXISTS tenants_owner_id_idx ON tenants(owner_id);
CREATE INDEX IF NOT EXISTS tenants_subscription_status_idx ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS tenants_slug_idx ON tenants(slug);

-- =============================================================================
-- TABLA: users (Usuarios del sistema)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    role text NOT NULL CHECK (role IN ('owner', 'admin', 'barber', 'client')),
    is_active boolean DEFAULT true,
    settings jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para users
CREATE INDEX IF NOT EXISTS users_tenant_id_idx ON users(tenant_id);
CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- =============================================================================
-- TABLA: providers (Barberos/Proveedores de servicios)
-- =============================================================================
CREATE TABLE IF NOT EXISTS providers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    bio text,
    specialties text[] DEFAULT '{}',
    commission_rate decimal(5,2) DEFAULT 0.00,
    role text DEFAULT 'barber' CHECK (role IN ('owner', 'admin', 'barber')),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para providers
CREATE INDEX IF NOT EXISTS providers_tenant_id_idx ON providers(tenant_id);
CREATE INDEX IF NOT EXISTS providers_user_id_idx ON providers(user_id);

-- =============================================================================
-- TABLA: services (Servicios ofrecidos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS services (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    duration_minutes integer NOT NULL DEFAULT 30,
    price integer NOT NULL DEFAULT 0, -- precio en centavos
    category text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para services
CREATE INDEX IF NOT EXISTS services_tenant_id_idx ON services(tenant_id);
CREATE INDEX IF NOT EXISTS services_is_active_idx ON services(is_active);

-- =============================================================================
-- TABLA: availability_blocks (Disponibilidad de barberos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS availability_blocks (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    is_available boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (start_datetime < end_datetime)
);

-- Índices para availability_blocks
CREATE INDEX IF NOT EXISTS availability_blocks_tenant_id_idx ON availability_blocks(tenant_id);
CREATE INDEX IF NOT EXISTS availability_blocks_provider_id_idx ON availability_blocks(provider_id);
CREATE INDEX IF NOT EXISTS availability_blocks_datetime_idx ON availability_blocks(start_datetime, end_datetime);

-- =============================================================================
-- TABLA: bookings (Reservas de clientes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS bookings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
    service_id uuid REFERENCES services(id) ON DELETE CASCADE,
    client_name text NOT NULL,
    client_email text,
    client_phone text NOT NULL,
    scheduled_date date NOT NULL,
    scheduled_time time NOT NULL,
    duration_minutes integer NOT NULL DEFAULT 30,
    total_price integer NOT NULL DEFAULT 0, -- precio en centavos
    status text DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes text,
    cancellation_reason text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para bookings
CREATE INDEX IF NOT EXISTS bookings_tenant_id_idx ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS bookings_provider_id_idx ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS bookings_service_id_idx ON bookings(service_id);
CREATE INDEX IF NOT EXISTS bookings_scheduled_idx ON bookings(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_client_phone_idx ON bookings(client_phone);

-- =============================================================================
-- TABLA: notifications (Notificaciones enviadas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    channel text NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
    message text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    external_id text, -- ID del proveedor externo (WhatsApp, email, etc.)
    error_message text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS notifications_tenant_id_idx ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS notifications_booking_id_idx ON notifications(booking_id);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);

-- =============================================================================
-- TABLA: audit_log (Log de auditoría)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type text NOT NULL, -- 'booking', 'user', 'service', etc.
    entity_id text,
    action text NOT NULL, -- 'create', 'update', 'delete', etc.
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para audit_log
CREATE INDEX IF NOT EXISTS audit_log_tenant_id_idx ON audit_log(tenant_id);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at);

-- =============================================================================
-- FUNCIONES PARA UPDATED_AT AUTOMÁTICO
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_availability_blocks_updated_at ON availability_blocks;
CREATE TRIGGER update_availability_blocks_updated_at BEFORE UPDATE ON availability_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para tenants
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
CREATE POLICY "Users can view their own tenant" ON tenants FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own tenant" ON tenants;
CREATE POLICY "Users can update their own tenant" ON tenants FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own tenant" ON tenants;
CREATE POLICY "Users can insert their own tenant" ON tenants FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Políticas para users (acceso por tenant)
DROP POLICY IF EXISTS "Users can view users in their tenant" ON users;
CREATE POLICY "Users can view users in their tenant" ON users FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage users in their tenant" ON users;
CREATE POLICY "Users can manage users in their tenant" ON users FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- Políticas para providers
DROP POLICY IF EXISTS "Providers accessible by tenant owners" ON providers;
CREATE POLICY "Providers accessible by tenant owners" ON providers FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- Políticas para services
DROP POLICY IF EXISTS "Services accessible by tenant owners" ON services;
CREATE POLICY "Services accessible by tenant owners" ON services FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- Políticas para availability_blocks
DROP POLICY IF EXISTS "Availability blocks accessible by tenant owners" ON availability_blocks;
CREATE POLICY "Availability blocks accessible by tenant owners" ON availability_blocks FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- Políticas para bookings
DROP POLICY IF EXISTS "Bookings accessible by tenant owners" ON bookings;
CREATE POLICY "Bookings accessible by tenant owners" ON bookings FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- Políticas para notifications
DROP POLICY IF EXISTS "Notifications accessible by tenant owners" ON notifications;
CREATE POLICY "Notifications accessible by tenant owners" ON notifications FOR ALL USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- Políticas para audit_log
DROP POLICY IF EXISTS "Audit log accessible by tenant owners" ON audit_log;
CREATE POLICY "Audit log accessible by tenant owners" ON audit_log FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE owner_id = auth.uid())
);

-- =============================================================================
-- DATOS DE EJEMPLO PARA DESARROLLO (OPCIONAL)
-- =============================================================================

-- Insertar un tenant de ejemplo (descomenta si quieres datos de prueba)
-- INSERT INTO tenants (slug, name, description, category, contact_phone, owner_id, subscription_status) 
-- VALUES (
--     'demo-barberia', 
--     'Demo Barbería', 
--     'Barbería de demostración para pruebas',
--     'Barbería Moderna',
--     '+57 300 123 4567',
--     auth.uid(), -- Usará el usuario autenticado actual
--     'active'
-- ) ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- MENSAJE DE FINALIZACIÓN
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Migración de Agendex completada exitosamente!';
    RAISE NOTICE 'Todas las tablas, índices, triggers y políticas RLS han sido creados.';
    RAISE NOTICE 'Tu instancia de Supabase está lista para usar con Agendex.';
END $$;