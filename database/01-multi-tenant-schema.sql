-- =============================================================================
-- ESQUEMA MULTI-TENANT PARA AGENDEX MVP
-- =============================================================================
-- Configuración inicial de base de datos multi-tenant para sistema de reservas
-- de barberías con Row Level Security (RLS)

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- =============================================================================
-- TABLA: tenants (barberías)
-- =============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL, -- para subdominios: barberia.agendex.studio
  name text NOT NULL,
  description text,
  logo_url text,
  contact_email text,
  contact_phone text,
  address text,
  instagram text,
  facebook text,
  whatsapp text,
  
  -- Configuración de horarios
  working_hours jsonb DEFAULT '{
    "monday": {"start": "09:00", "end": "18:00", "enabled": true},
    "tuesday": {"start": "09:00", "end": "18:00", "enabled": true},
    "wednesday": {"start": "09:00", "end": "18:00", "enabled": true},
    "thursday": {"start": "09:00", "end": "18:00", "enabled": true},
    "friday": {"start": "09:00", "end": "18:00", "enabled": true},
    "saturday": {"start": "09:00", "end": "15:00", "enabled": true},
    "sunday": {"start": "10:00", "end": "14:00", "enabled": false}
  }'::jsonb,
  
  -- Configuración de slots (intervalos de tiempo)
  slot_duration_minutes integer DEFAULT 45,
  break_duration_minutes integer DEFAULT 15,
  
  -- Suscripción y estado
  subscription_status text DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled')),
  subscription_plan text DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  
  -- Metadatos
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription ON tenants(subscription_status, subscription_plan);

-- =============================================================================
-- TABLA: users (usuarios del sistema)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Datos básicos
  email text UNIQUE NOT NULL,
  password_hash text,
  name text NOT NULL,
  phone text,
  avatar_url text,
  
  -- Rol y permisos
  role text DEFAULT 'client' CHECK (role IN ('owner', 'barber', 'client')),
  permissions jsonb DEFAULT '[]'::jsonb,
  
  -- Estado
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  
  -- Autenticación
  last_login_at timestamptz,
  login_count integer DEFAULT 0,
  
  -- Metadatos
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(tenant_id, role);

-- =============================================================================
-- TABLA: services (servicios de barbería)
-- =============================================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Datos del servicio
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 45,
  price decimal(10,2) NOT NULL,
  
  -- Configuración
  is_active boolean DEFAULT true,
  requires_deposit boolean DEFAULT false,
  deposit_amount decimal(10,2) DEFAULT 0,
  
  -- Disponibilidad
  available_for_online_booking boolean DEFAULT true,
  max_advance_booking_days integer DEFAULT 30,
  
  -- Metadatos
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para services
CREATE INDEX IF NOT EXISTS idx_services_tenant ON services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(tenant_id, is_active);

-- =============================================================================
-- TABLA: availability (disponibilidad de barberos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  barber_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Rango de fechas
  date_from date NOT NULL,
  date_to date NOT NULL,
  
  -- Horarios (si es null, usa los del tenant)
  time_from time,
  time_to time,
  
  -- Tipo de disponibilidad
  type text NOT NULL CHECK (type IN ('available', 'blocked', 'vacation', 'break')),
  reason text,
  
  -- Recurrencia (para horarios regulares)
  is_recurring boolean DEFAULT false,
  recurrence_pattern jsonb, -- días de la semana, etc.
  
  -- Metadatos
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para availability
CREATE INDEX IF NOT EXISTS idx_availability_tenant ON availability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_availability_barber_date ON availability(barber_id, date_from, date_to);

-- =============================================================================
-- TABLA: bookings (reservas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Participantes
  client_id uuid REFERENCES users(id) ON DELETE SET NULL,
  barber_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  
  -- Datos del cliente (para clientes no registrados)
  client_name text,
  client_email text,
  client_phone text,
  
  -- Fecha y hora
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  
  -- Rango temporal para constraint de no solapamiento
  time_range tstzrange GENERATED ALWAYS AS (
    tstzrange(
      (booking_date::text || ' ' || start_time)::timestamptz,
      (booking_date::text || ' ' || end_time)::timestamptz,
      '[)'
    )
  ) STORED,
  
  -- Estado y seguimiento
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  internal_notes text, -- solo para staff
  
  -- Precios
  service_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  deposit_paid decimal(10,2) DEFAULT 0,
  
  -- Timestamps de estado
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  
  -- Notificaciones
  reminder_sent_24h boolean DEFAULT false,
  reminder_sent_2h boolean DEFAULT false,
  confirmation_sent boolean DEFAULT false,
  
  -- Soft delete
  deleted_at timestamptz,
  
  -- Metadatos
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para bookings
CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_barber_date ON bookings(barber_id, booking_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(tenant_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON bookings(booking_date, start_time, end_time) WHERE deleted_at IS NULL;

-- Constraint para evitar solapamiento de reservas
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
  EXCLUDE USING gist (barber_id WITH =, time_range WITH &&)
  WHERE (deleted_at IS NULL AND status NOT IN ('cancelled', 'no_show'));

-- =============================================================================
-- TABLA: waitlist (lista de espera)
-- =============================================================================
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Cliente
  client_id uuid REFERENCES users(id) ON DELETE CASCADE,
  client_name text,
  client_email text,
  client_phone text,
  
  -- Preferencias
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES users(id) ON DELETE CASCADE, -- null = cualquier barbero
  preferred_date_from date,
  preferred_date_to date,
  preferred_times text[], -- ['morning', 'afternoon', 'evening']
  
  -- Estado
  status text DEFAULT 'active' CHECK (status IN ('active', 'notified', 'booked', 'expired', 'cancelled')),
  priority integer DEFAULT 1,
  
  -- Notificaciones
  notification_sent_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  
  -- Metadatos
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_tenant ON waitlist(tenant_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_service ON waitlist(service_id, status);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON waitlist(tenant_id, status, priority, created_at);

-- =============================================================================
-- TABLA: notifications (notificaciones)
-- =============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Destinatario
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipient_email text,
  recipient_phone text,
  
  -- Contenido
  type text NOT NULL CHECK (type IN ('email', 'sms', 'whatsapp', 'push')),
  subject text,
  message text NOT NULL,
  template_name text,
  template_data jsonb DEFAULT '{}'::jsonb,
  
  -- Estado
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'cancelled')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  
  -- Programación
  scheduled_for timestamptz DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  
  -- Respuesta del proveedor
  provider_id text,
  provider_response jsonb,
  error_message text,
  
  -- Metadatos
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);

-- =============================================================================
-- TABLA: audit_log (log de auditoría)
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Actor
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_email text,
  
  -- Acción
  entity_type text NOT NULL, -- 'booking', 'user', 'service', etc.
  entity_id uuid,
  action text NOT NULL, -- 'create', 'update', 'delete', etc.
  
  -- Datos
  old_values jsonb,
  new_values jsonb,
  changes jsonb,
  
  -- Contexto
  ip_address inet,
  user_agent text,
  
  -- Metadatos
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índices para audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_tenant ON audit_log(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at);

-- =============================================================================
-- FUNCIONES Y TRIGGERS
-- =============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para timestamps de estado en bookings
CREATE OR REPLACE FUNCTION set_booking_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Confirmación
    IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' AND NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at = now();
    END IF;
    
    -- Completado
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' AND NEW.completed_at IS NULL THEN
      NEW.completed_at = now();
    END IF;
    
    -- Cancelado
    IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' AND NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_booking_status_timestamps_trigger
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_booking_status_timestamps();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para tenants (solo owners pueden ver/editar su tenant)
CREATE POLICY "Users can view their own tenant" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their tenant" ON tenants
  FOR UPDATE USING (
    id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Políticas para users (usuarios pueden ver otros del mismo tenant)
CREATE POLICY "Users can view users in their tenant" ON users
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Owners and barbers can manage users in their tenant" ON users
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'barber')
    )
  );

-- Políticas para services (solo del mismo tenant)
CREATE POLICY "Users can view services in their tenant" ON services
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Owners and barbers can manage services" ON services
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'barber')
    )
  );

-- Políticas para availability
CREATE POLICY "Users can view availability in their tenant" ON availability
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Barbers can manage their own availability" ON availability
  FOR ALL USING (
    barber_id = auth.uid() OR
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Políticas para bookings
CREATE POLICY "Users can view bookings in their tenant" ON bookings
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    ) OR
    client_id = auth.uid()
  );

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    ) OR
    client_id = auth.uid()
  );

CREATE POLICY "Staff can manage bookings in their tenant" ON bookings
  FOR ALL USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'barber')
    ) OR
    client_id = auth.uid()
  );

-- Políticas para waitlist
CREATE POLICY "Users can view waitlist in their tenant" ON waitlist
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid()
    ) OR
    client_id = auth.uid()
  );

CREATE POLICY "Users can manage their own waitlist entries" ON waitlist
  FOR ALL USING (
    client_id = auth.uid() OR
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'barber')
    )
  );

-- Políticas para notifications
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'barber')
    )
  );

-- Políticas para audit_log (solo lectura para owners)
CREATE POLICY "Owners can view audit log" ON audit_log
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- =============================================================================
-- COMENTARIOS
-- =============================================================================

COMMENT ON TABLE tenants IS 'Barberías/salones registrados en el sistema';
COMMENT ON TABLE users IS 'Usuarios del sistema (owners, barbers, clients)';
COMMENT ON TABLE services IS 'Servicios ofrecidos por cada barbería';
COMMENT ON TABLE availability IS 'Disponibilidad y bloqueos de barberos';
COMMENT ON TABLE bookings IS 'Reservas de clientes';
COMMENT ON TABLE waitlist IS 'Lista de espera para reservas';
COMMENT ON TABLE notifications IS 'Notificaciones enviadas (email, SMS, WhatsApp)';
COMMENT ON TABLE audit_log IS 'Log de auditoría de acciones del sistema';

COMMENT ON COLUMN tenants.slug IS 'Identificador único para subdominios (ej: barberia-centro)';
COMMENT ON COLUMN tenants.working_hours IS 'Horarios de trabajo por día de la semana';
COMMENT ON COLUMN tenants.subscription_status IS 'Estado de la suscripción del tenant';
COMMENT ON COLUMN bookings.time_range IS 'Rango temporal generado para constraint de no solapamiento';
COMMENT ON CONSTRAINT bookings_no_overlap ON bookings IS 'Previene reservas solapadas para el mismo barbero';