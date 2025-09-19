-- =============================================================================
-- DATOS INICIALES PARA AGENDEX MVP
-- =============================================================================
-- Semilla de datos para 5 barberías demo con servicios y usuarios básicos

-- =============================================================================
-- INSERTAR TENANTS (BARBERÍAS DEMO)
-- =============================================================================

INSERT INTO tenants (id, slug, name, description, contact_email, contact_phone, address, instagram, whatsapp, working_hours, slot_duration_minutes, subscription_status, subscription_plan) VALUES

-- Barbería 1: Estilo Clásico
(
  '550e8400-e29b-41d4-a716-446655440001',
  'estilo-clasico',
  'Estilo Clásico Barbería',
  'Barbería tradicional con más de 20 años de experiencia. Especialistas en cortes clásicos y afeitado con navaja.',
  'contacto@estiloclasico.com',
  '+56912345001',
  'Av. Providencia 1234, Providencia, Santiago',
  '@estiloclasico',
  '+56912345001',
  '{
    "monday": {"start": "09:00", "end": "19:00", "enabled": true},
    "tuesday": {"start": "09:00", "end": "19:00", "enabled": true},
    "wednesday": {"start": "09:00", "end": "19:00", "enabled": true},
    "thursday": {"start": "09:00", "end": "19:00", "enabled": true},
    "friday": {"start": "09:00", "end": "20:00", "enabled": true},
    "saturday": {"start": "08:00", "end": "18:00", "enabled": true},
    "sunday": {"start": "10:00", "end": "15:00", "enabled": false}
  }',
  45,
  'active',
  'premium'
),

-- Barbería 2: Urban Cuts
(
  '550e8400-e29b-41d4-a716-446655440002',
  'urban-cuts',
  'Urban Cuts',
  'Barbería moderna especializada en cortes urbanos y tendencias actuales. Ambiente relajado y música de calidad.',
  'hola@urbancuts.cl',
  '+56912345002',
  'Av. Las Condes 5678, Las Condes, Santiago',
  '@urbancuts_stgo',
  '+56912345002',
  '{
    "monday": {"start": "10:00", "end": "20:00", "enabled": true},
    "tuesday": {"start": "10:00", "end": "20:00", "enabled": true},
    "wednesday": {"start": "10:00", "end": "20:00", "enabled": true},
    "thursday": {"start": "10:00", "end": "20:00", "enabled": true},
    "friday": {"start": "10:00", "end": "21:00", "enabled": true},
    "saturday": {"start": "09:00", "end": "19:00", "enabled": true},
    "sunday": {"start": "11:00", "end": "17:00", "enabled": true}
  }',
  30,
  'active',
  'basic'
),

-- Barbería 3: Gentleman's Club
(
  '550e8400-e29b-41d4-a716-446655440003',
  'gentlemans-club',
  'Gentleman''s Club Barbería',
  'Experiencia premium para el caballero moderno. Servicios de barbería, spa y cuidado personal masculino.',
  'reservas@gentlemansclub.cl',
  '+56912345003',
  'Av. Vitacura 9876, Vitacura, Santiago',
  '@gentlemansclub_chile',
  '+56912345003',
  '{
    "monday": {"start": "08:00", "end": "20:00", "enabled": true},
    "tuesday": {"start": "08:00", "end": "20:00", "enabled": true},
    "wednesday": {"start": "08:00", "end": "20:00", "enabled": true},
    "thursday": {"start": "08:00", "end": "20:00", "enabled": true},
    "friday": {"start": "08:00", "end": "21:00", "enabled": true},
    "saturday": {"start": "08:00", "end": "19:00", "enabled": true},
    "sunday": {"start": "10:00", "end": "16:00", "enabled": false}
  }',
  60,
  'active',
  'enterprise'
),

-- Barbería 4: Barrio Norte
(
  '550e8400-e29b-41d4-a716-446655440004',
  'barrio-norte',
  'Barrio Norte Barbería',
  'Barbería de barrio con tradición familiar. Atención personalizada y precios accesibles para toda la familia.',
  'info@barrionorte.cl',
  '+56912345004',
  'Av. Independencia 2468, Independencia, Santiago',
  '@barrionorte_barberia',
  '+56912345004',
  '{
    "monday": {"start": "09:30", "end": "18:30", "enabled": true},
    "tuesday": {"start": "09:30", "end": "18:30", "enabled": true},
    "wednesday": {"start": "09:30", "end": "18:30", "enabled": true},
    "thursday": {"start": "09:30", "end": "18:30", "enabled": true},
    "friday": {"start": "09:30", "end": "19:30", "enabled": true},
    "saturday": {"start": "09:00", "end": "17:00", "enabled": true},
    "sunday": {"start": "10:00", "end": "14:00", "enabled": false}
  }',
  40,
  'trial',
  'basic'
),

-- Barbería 5: The Razor
(
  '550e8400-e29b-41d4-a716-446655440005',
  'the-razor',
  'The Razor Barbershop',
  'Barbería especializada en afeitado clásico y cortes de precisión. Ambiente vintage con técnicas tradicionales.',
  'contacto@therazor.cl',
  '+56912345005',
  'Av. Ñuñoa 1357, Ñuñoa, Santiago',
  '@therazor_barbershop',
  '+56912345005',
  '{
    "monday": {"start": "10:00", "end": "19:00", "enabled": true},
    "tuesday": {"start": "10:00", "end": "19:00", "enabled": true},
    "wednesday": {"start": "10:00", "end": "19:00", "enabled": true},
    "thursday": {"start": "10:00", "end": "19:00", "enabled": true},
    "friday": {"start": "10:00", "end": "20:00", "enabled": true},
    "saturday": {"start": "09:00", "end": "18:00", "enabled": true},
    "sunday": {"start": "11:00", "end": "16:00", "enabled": false}
  }',
  50,
  'active',
  'basic'
);

-- =============================================================================
-- INSERTAR USUARIOS (OWNERS Y BARBERS)
-- =============================================================================

-- Owners de cada barbería
INSERT INTO users (id, tenant_id, email, name, phone, role, status, email_verified) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'carlos@estiloclasico.com', 'Carlos Mendoza', '+56912345001', 'owner', 'active', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'sofia@urbancuts.cl', 'Sofía Rodríguez', '+56912345002', 'owner', 'active', true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'ricardo@gentlemansclub.cl', 'Ricardo Valenzuela', '+56912345003', 'owner', 'active', true),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'maria@barrionorte.cl', 'María González', '+56912345004', 'owner', 'active', true),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'diego@therazor.cl', 'Diego Morales', '+56912345005', 'owner', 'active', true);

-- Barberos para cada barbería
INSERT INTO users (id, tenant_id, email, name, phone, role, status, email_verified) VALUES
-- Estilo Clásico - Barberos
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'juan@estiloclasico.com', 'Juan Pérez', '+56987654001', 'barber', 'active', true),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'pedro@estiloclasico.com', 'Pedro Silva', '+56987654002', 'barber', 'active', true),

-- Urban Cuts - Barberos
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'alex@urbancuts.cl', 'Alex Torres', '+56987654003', 'barber', 'active', true),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'camila@urbancuts.cl', 'Camila Herrera', '+56987654004', 'barber', 'active', true),

-- Gentleman's Club - Barberos
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'fernando@gentlemansclub.cl', 'Fernando Castillo', '+56987654005', 'barber', 'active', true),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'valentina@gentlemansclub.cl', 'Valentina López', '+56987654006', 'barber', 'active', true),
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'sebastian@gentlemansclub.cl', 'Sebastián Rojas', '+56987654007', 'barber', 'active', true),

-- Barrio Norte - Barberos
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 'luis@barrionorte.cl', 'Luis Martínez', '+56987654008', 'barber', 'active', true),

-- The Razor - Barberos
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'nicolas@therazor.cl', 'Nicolás Fuentes', '+56987654009', 'barber', 'active', true),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005', 'javiera@therazor.cl', 'Javiera Soto', '+56987654010', 'barber', 'active', true);

-- =============================================================================
-- INSERTAR SERVICIOS PARA CADA BARBERÍA
-- =============================================================================

-- Servicios para Estilo Clásico
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Corte Clásico', 'Corte tradicional con tijera y máquina, incluye lavado', 45, 15000, true),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Afeitado con Navaja', 'Afeitado tradicional con navaja y toallas calientes', 30, 12000, true),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Corte + Barba', 'Servicio completo de corte y arreglo de barba', 60, 22000, true),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Arreglo de Barba', 'Perfilado y arreglo de barba existente', 20, 8000, true);

-- Servicios para Urban Cuts
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Fade Moderno', 'Corte degradado moderno con diseños', 30, 18000, true),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Undercut', 'Corte undercut con styling', 35, 20000, true),
('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Buzz Cut', 'Corte al ras con máquina', 15, 12000, true),
('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Barba Hipster', 'Arreglo de barba estilo hipster', 25, 15000, true);

-- Servicios para Gentleman's Club
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Experiencia Premium', 'Corte + afeitado + masaje facial + bebida', 90, 45000, true),
('880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Corte Ejecutivo', 'Corte profesional para ejecutivos', 45, 25000, true),
('880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Tratamiento Capilar', 'Tratamiento profesional para el cabello', 60, 35000, true),
('880e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Manicure Masculina', 'Cuidado profesional de uñas', 30, 18000, true);

-- Servicios para Barrio Norte
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Corte Familiar', 'Corte tradicional para toda la familia', 40, 12000, true),
('880e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'Corte Niños', 'Corte especial para niños hasta 12 años', 30, 8000, true),
('880e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'Afeitado Básico', 'Afeitado con máquina y crema', 20, 6000, true),
('880e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', 'Lavado + Peinado', 'Lavado y peinado profesional', 25, 7000, true);

-- Servicios para The Razor
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, is_active) VALUES
('880e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440005', 'Afeitado Vintage', 'Afeitado tradicional con navaja y ritual completo', 50, 20000, true),
('880e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440005', 'Corte Pompadour', 'Corte estilo pompadour con styling', 45, 22000, true),
('880e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440005', 'Barba Completa', 'Arreglo completo de barba con aceites', 35, 16000, true),
('880e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440005', 'Ritual Completo', 'Corte + afeitado + tratamiento de barba', 75, 35000, true);

-- =============================================================================
-- INSERTAR DISPONIBILIDAD BÁSICA PARA BARBEROS
-- =============================================================================

-- Disponibilidad para los próximos 30 días (lunes a sábado)
INSERT INTO availability (id, tenant_id, barber_id, date_from, date_to, time_from, time_to, type, is_recurring)
SELECT 
  uuid_generate_v4(),
  u.tenant_id,
  u.id,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  '09:00'::time,
  '18:00'::time,
  'available',
  true
FROM users u
WHERE u.role = 'barber';

-- =============================================================================
-- INSERTAR ALGUNAS RESERVAS DE EJEMPLO
-- =============================================================================

-- Reservas para los próximos días
INSERT INTO bookings (id, tenant_id, client_name, client_email, client_phone, barber_id, service_id, booking_date, start_time, end_time, status, service_price, total_price, notes) VALUES

-- Reservas para Estilo Clásico
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440001',
  'Roberto Sánchez',
  'roberto.sanchez@email.com',
  '+56987123456',
  '770e8400-e29b-41d4-a716-446655440001',
  '880e8400-e29b-41d4-a716-446655440001',
  CURRENT_DATE + INTERVAL '1 day',
  '10:00'::time,
  '10:45'::time,
  'confirmed',
  15000,
  15000,
  'Cliente regular, prefiere corte no muy corto'
),

-- Reservas para Urban Cuts
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440002',
  'Andrés Moreno',
  'andres.moreno@email.com',
  '+56987123457',
  '770e8400-e29b-41d4-a716-446655440003',
  '880e8400-e29b-41d4-a716-446655440005',
  CURRENT_DATE + INTERVAL '2 days',
  '14:00'::time,
  '14:30'::time,
  'pending',
  18000,
  18000,
  'Quiere un fade bien marcado'
),

-- Reservas para Gentleman's Club
(
  uuid_generate_v4(),
  '550e8400-e29b-41d4-a716-446655440003',
  'Eduardo Ramírez',
  'eduardo.ramirez@email.com',
  '+56987123458',
  '770e8400-e29b-41d4-a716-446655440005',
  '880e8400-e29b-41d4-a716-446655440009',
  CURRENT_DATE + INTERVAL '3 days',
  '16:00'::time,
  '17:30'::time,
  'confirmed',
  45000,
  45000,
  'Experiencia completa para evento importante'
);

-- =============================================================================
-- COMENTARIOS FINALES
-- =============================================================================

-- Este archivo crea:
-- ✅ 5 barberías demo con diferentes perfiles
-- ✅ 1 owner por barbería (5 total)
-- ✅ 2-3 barberos por barbería (10 total)
-- ✅ 4 servicios por barbería (20 total)
-- ✅ Disponibilidad básica para todos los barberos
-- ✅ Algunas reservas de ejemplo

-- Las barberías están listas para:
-- 🎯 Recibir reservas online
-- 🎯 Gestionar servicios y precios
-- 🎯 Administrar horarios y disponibilidad
-- 🎯 Procesar pagos (cuando se implemente)

SELECT 'Datos iniciales insertados correctamente' as status;