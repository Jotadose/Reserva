-- ===================================================
-- MIGRACIONES PARA DATOS REALES DESDE BD 
-- ===================================================

-- Agregar campos adicionales a la tabla services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS bookings_count INTEGER DEFAULT 0;

-- Crear índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_services_tenant_featured ON services(tenant_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_services_tenant_active ON services(tenant_id, is_active);

-- ===================================================
-- TABLA BOOKINGS (Reservas)
-- ===================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    
    -- Información de la reserva
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    -- Estado y precios
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    total_price INTEGER NOT NULL, -- en centavos
    paid_amount INTEGER DEFAULT 0, -- en centavos
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
    
    -- Información adicional
    notes TEXT,
    cancellation_reason TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT bookings_time_check CHECK (end_time > start_time),
    CONSTRAINT bookings_price_check CHECK (total_price >= 0),
    CONSTRAINT bookings_paid_check CHECK (paid_amount >= 0 AND paid_amount <= total_price)
);

-- Índices para bookings
CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_date ON bookings(tenant_id, booking_date);

-- ===================================================
-- TABLA CLIENTS (Clientes)
-- ===================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Información personal
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    birth_date DATE,
    
    -- Preferencias
    preferred_time_slots TEXT[], -- ['morning', 'afternoon', 'evening']
    notes TEXT,
    
    -- Estadísticas
    total_bookings INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0, -- en centavos
    last_visit DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, email)
);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

-- ===================================================
-- TABLA PROVIDERS (Proveedores/Barberos)
-- ===================================================
CREATE TABLE IF NOT EXISTS providers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Información personal
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Información profesional
    specialties TEXT[], -- ['cortes', 'barba', 'color', 'tratamientos']
    experience_years INTEGER DEFAULT 0,
    bio TEXT,
    avatar_url TEXT,
    
    -- Configuración
    is_active BOOLEAN DEFAULT true,
    available_days INTEGER[] DEFAULT '{1,2,3,4,5,6}', -- 0=domingo, 6=sábado
    work_start_time TIME DEFAULT '09:00',
    work_end_time TIME DEFAULT '18:00',
    break_start_time TIME DEFAULT '13:00',
    break_end_time TIME DEFAULT '14:00',
    
    -- Estadísticas
    total_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    total_earnings INTEGER DEFAULT 0, -- en centavos
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, email)
);

-- Índices para providers
CREATE INDEX IF NOT EXISTS idx_providers_tenant ON providers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_providers_active ON providers(is_active);

-- ===================================================
-- POLÍTICAS RLS (Row Level Security)
-- ===================================================

-- Habilitar RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Políticas para bookings
CREATE POLICY "bookings_tenant_isolation" ON bookings
    USING (tenant_id = current_tenant_id());

-- Políticas para clients
CREATE POLICY "clients_tenant_isolation" ON clients
    USING (tenant_id = current_tenant_id());

-- Políticas para providers
CREATE POLICY "providers_tenant_isolation" ON providers
    USING (tenant_id = current_tenant_id());

-- Política pública para lectura de providers (para mostrar en landing)
CREATE POLICY "providers_public_read" ON providers
    FOR SELECT TO public
    USING (is_active = true);

-- ===================================================
-- TRIGGERS PARA ACTUALIZAR ESTADÍSTICAS
-- ===================================================

-- Función para actualizar estadísticas de servicios
CREATE OR REPLACE FUNCTION update_service_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar bookings_count y average_rating para el servicio
    UPDATE services 
    SET 
        bookings_count = (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
            AND status NOT IN ('cancelled', 'no_show')
        ),
        average_rating = (
            SELECT COALESCE(AVG(rating), 0.0)
            FROM bookings 
            WHERE service_id = COALESCE(NEW.service_id, OLD.service_id)
            AND rating IS NOT NULL
            AND status = 'completed'
        )
    WHERE id = COALESCE(NEW.service_id, OLD.service_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stats cuando se modifica una reserva
CREATE TRIGGER trigger_update_service_stats
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_service_stats();

-- Función para actualizar estadísticas de clientes
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar total_bookings, total_spent y last_visit para el cliente
    UPDATE clients 
    SET 
        total_bookings = (
            SELECT COUNT(*) 
            FROM bookings 
            WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)
            AND status = 'completed'
        ),
        total_spent = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM bookings 
            WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)
            AND status = 'completed'
        ),
        last_visit = (
            SELECT MAX(booking_date)
            FROM bookings 
            WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)
            AND status = 'completed'
        )
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stats de cliente
CREATE TRIGGER trigger_update_client_stats
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW
    WHEN (NEW.client_id IS NOT NULL OR OLD.client_id IS NOT NULL)
    EXECUTE FUNCTION update_client_stats();

-- ===================================================
-- DATOS DE EJEMPLO PARA TESTING
-- ===================================================

-- Insertar un tenant de ejemplo si no existe
INSERT INTO tenants (id, slug, name, subscription_status, subscription_plan, contact_email, contact_phone)
VALUES (
    'demo-tenant-id'::uuid,
    'agendex',
    'Barbería AgendEx',
    'active',
    'premium',
    'contacto@agendex.com',
    '+56 9 1234 5678'
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    contact_email = EXCLUDED.contact_email,
    contact_phone = EXCLUDED.contact_phone;

-- Insertar servicios de ejemplo con featured
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, category, is_active, is_featured) VALUES
('service-1'::uuid, 'demo-tenant-id'::uuid, 'Corte Clásico', 'Corte tradicional con técnicas modernas', 45, 25000, 'cortes', true, true),
('service-2'::uuid, 'demo-tenant-id'::uuid, 'Barba Completa', 'Arreglo completo de barba con perfilado', 30, 20000, 'barba', true, true),
('service-3'::uuid, 'demo-tenant-id'::uuid, 'Corte + Barba Premium', 'Combo completo con tratamiento', 75, 40000, 'combos', true, true),
('service-4'::uuid, 'demo-tenant-id'::uuid, 'Afeitado Tradicional', 'Afeitado clásico con navaja', 40, 30000, 'afeitado', true, false),
('service-5'::uuid, 'demo-tenant-id'::uuid, 'Tratamiento Capilar', 'Tratamiento revitalizante', 60, 35000, 'tratamientos', true, false),
('service-6'::uuid, 'demo-tenant-id'::uuid, 'Corte Fade', 'Corte moderno con degradado', 50, 28000, 'cortes', true, false)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    is_featured = EXCLUDED.is_featured;

-- Insertar algunos clientes de ejemplo
INSERT INTO clients (id, tenant_id, name, email, phone) VALUES
('client-1'::uuid, 'demo-tenant-id'::uuid, 'Juan Pérez', 'juan@email.com', '+56 9 1111 1111'),
('client-2'::uuid, 'demo-tenant-id'::uuid, 'Carlos Silva', 'carlos@email.com', '+56 9 2222 2222'),
('client-3'::uuid, 'demo-tenant-id'::uuid, 'Luis Martín', 'luis@email.com', '+56 9 3333 3333')
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Insertar un proveedor de ejemplo
INSERT INTO providers (id, tenant_id, name, email, specialties, is_active) VALUES
('provider-1'::uuid, 'demo-tenant-id'::uuid, 'Master Barber', 'barber@agendex.com', ARRAY['cortes', 'barba', 'afeitado'], true)
ON CONFLICT (tenant_id, email) DO NOTHING;

-- Insertar algunas reservas de ejemplo
INSERT INTO bookings (id, tenant_id, service_id, client_id, provider_id, booking_date, start_time, end_time, duration_minutes, status, total_price, rating) VALUES
('booking-1'::uuid, 'demo-tenant-id'::uuid, 'service-1'::uuid, 'client-1'::uuid, 'provider-1'::uuid, CURRENT_DATE + INTERVAL '1 day', '10:00', '10:45', 45, 'confirmed', 25000, null),
('booking-2'::uuid, 'demo-tenant-id'::uuid, 'service-2'::uuid, 'client-2'::uuid, 'provider-1'::uuid, CURRENT_DATE - INTERVAL '1 day', '14:00', '14:30', 30, 'completed', 20000, 5),
('booking-3'::uuid, 'demo-tenant-id'::uuid, 'service-3'::uuid, 'client-3'::uuid, 'provider-1'::uuid, CURRENT_DATE - INTERVAL '2 days', '16:00', '17:15', 75, 'completed', 40000, 5)
ON CONFLICT (id) DO NOTHING;