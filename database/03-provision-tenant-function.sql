-- =============================================================================
-- FUNCIÓN PROVISION TENANT PARA AGENDEX
-- =============================================================================
-- Función que crea automáticamente una nueva barbería con:
-- - Tenant (barbería)
-- - Usuario owner
-- - Servicios básicos predeterminados
-- - Disponibilidad inicial para el owner

-- =============================================================================
-- FUNCIÓN PRINCIPAL: provision_tenant
-- =============================================================================

CREATE OR REPLACE FUNCTION provision_tenant(
  p_slug VARCHAR(100),
  p_name VARCHAR(255),
  p_description TEXT DEFAULT NULL,
  p_owner_email VARCHAR(255),
  p_owner_name VARCHAR(255),
  p_owner_phone VARCHAR(20) DEFAULT NULL,
  p_contact_email VARCHAR(255) DEFAULT NULL,
  p_contact_phone VARCHAR(20) DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_instagram VARCHAR(100) DEFAULT NULL,
  p_whatsapp VARCHAR(20) DEFAULT NULL,
  p_subscription_plan VARCHAR(20) DEFAULT 'trial'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
  v_owner_id UUID;
  v_service_ids UUID[];
  v_result JSON;
  v_default_working_hours JSON;
BEGIN
  -- Validar que el slug no exista
  IF EXISTS (SELECT 1 FROM tenants WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'El slug "% " ya está en uso', p_slug;
  END IF;

  -- Validar que el email del owner no exista
  IF EXISTS (SELECT 1 FROM users WHERE email = p_owner_email) THEN
    RAISE EXCEPTION 'El email "% " ya está registrado', p_owner_email;
  END IF;

  -- Generar IDs
  v_tenant_id := uuid_generate_v4();
  v_owner_id := uuid_generate_v4();

  -- Horarios de trabajo por defecto
  v_default_working_hours := '{
    "monday": {"start": "09:00", "end": "18:00", "enabled": true},
    "tuesday": {"start": "09:00", "end": "18:00", "enabled": true},
    "wednesday": {"start": "09:00", "end": "18:00", "enabled": true},
    "thursday": {"start": "09:00", "end": "18:00", "enabled": true},
    "friday": {"start": "09:00", "end": "19:00", "enabled": true},
    "saturday": {"start": "09:00", "end": "17:00", "enabled": true},
    "sunday": {"start": "10:00", "end": "15:00", "enabled": false}
  }'::JSON;

  -- 1. Crear el tenant (barbería)
  INSERT INTO tenants (
    id,
    slug,
    name,
    description,
    contact_email,
    contact_phone,
    address,
    instagram,
    whatsapp,
    working_hours,
    slot_duration_minutes,
    subscription_status,
    subscription_plan
  ) VALUES (
    v_tenant_id,
    p_slug,
    p_name,
    COALESCE(p_description, 'Barbería profesional con servicios de calidad'),
    COALESCE(p_contact_email, p_owner_email),
    COALESCE(p_contact_phone, p_owner_phone),
    p_address,
    p_instagram,
    p_whatsapp,
    v_default_working_hours,
    30, -- duración de slot por defecto
    CASE 
      WHEN p_subscription_plan = 'trial' THEN 'trial'
      ELSE 'active'
    END,
    p_subscription_plan
  );

  -- 2. Crear el usuario owner
  INSERT INTO users (
    id,
    tenant_id,
    email,
    name,
    phone,
    role,
    status,
    email_verified
  ) VALUES (
    v_owner_id,
    v_tenant_id,
    p_owner_email,
    p_owner_name,
    p_owner_phone,
    'owner',
    'active',
    false -- Requerirá verificación de email
  );

  -- 3. Crear servicios básicos predeterminados
  WITH default_services AS (
    SELECT * FROM (
      VALUES 
        ('Corte Clásico', 'Corte tradicional con tijera y máquina', 30, 15000),
        ('Corte + Barba', 'Servicio completo de corte y arreglo de barba', 45, 25000),
        ('Arreglo de Barba', 'Perfilado y arreglo de barba', 20, 12000),
        ('Afeitado', 'Afeitado profesional con navaja', 25, 10000)
    ) AS t(name, description, duration, price)
  )
  INSERT INTO services (
    id,
    tenant_id,
    name,
    description,
    duration_minutes,
    price,
    is_active
  )
  SELECT 
    uuid_generate_v4(),
    v_tenant_id,
    ds.name,
    ds.description,
    ds.duration,
    ds.price,
    true
  FROM default_services ds
  RETURNING id INTO v_service_ids;

  -- 4. Crear disponibilidad inicial para el owner (próximos 30 días)
  INSERT INTO availability (
    id,
    tenant_id,
    barber_id,
    date_from,
    date_to,
    time_from,
    time_to,
    type,
    is_recurring
  ) VALUES (
    uuid_generate_v4(),
    v_tenant_id,
    v_owner_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    '09:00'::time,
    '18:00'::time,
    'available',
    true
  );

  -- 5. Registrar en audit_log
  INSERT INTO audit_log (
    id,
    tenant_id,
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    uuid_generate_v4(),
    v_tenant_id,
    v_owner_id,
    'CREATE',
    'tenants',
    v_tenant_id::text,
    NULL,
    json_build_object(
      'tenant_id', v_tenant_id,
      'slug', p_slug,
      'name', p_name,
      'owner_email', p_owner_email,
      'subscription_plan', p_subscription_plan
    )
  );

  -- 6. Preparar respuesta
  v_result := json_build_object(
    'success', true,
    'message', 'Barbería creada exitosamente',
    'data', json_build_object(
      'tenant_id', v_tenant_id,
      'slug', p_slug,
      'name', p_name,
      'owner_id', v_owner_id,
      'owner_email', p_owner_email,
      'subscription_plan', p_subscription_plan,
      'services_created', array_length(v_service_ids, 1),
      'url', 'https://' || p_slug || '.agendex.studio'
    )
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, devolver información del error
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Error al crear la barbería: ' || SQLERRM
    );
END;
$$;

-- =============================================================================
-- FUNCIÓN AUXILIAR: get_tenant_info
-- =============================================================================
-- Función para obtener información completa de un tenant

CREATE OR REPLACE FUNCTION get_tenant_info(p_slug VARCHAR(100))
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'tenant', json_build_object(
      'id', t.id,
      'slug', t.slug,
      'name', t.name,
      'description', t.description,
      'contact_email', t.contact_email,
      'contact_phone', t.contact_phone,
      'address', t.address,
      'instagram', t.instagram,
      'whatsapp', t.whatsapp,
      'working_hours', t.working_hours,
      'subscription_status', t.subscription_status,
      'subscription_plan', t.subscription_plan,
      'created_at', t.created_at
    ),
    'owner', json_build_object(
      'id', u.id,
      'name', u.name,
      'email', u.email,
      'phone', u.phone,
      'email_verified', u.email_verified
    ),
    'services', (
      SELECT json_agg(
        json_build_object(
          'id', s.id,
          'name', s.name,
          'description', s.description,
          'duration_minutes', s.duration_minutes,
          'price', s.price,
          'is_active', s.is_active
        )
      )
      FROM services s
      WHERE s.tenant_id = t.id AND s.is_active = true
    ),
    'barbers', (
      SELECT json_agg(
        json_build_object(
          'id', b.id,
          'name', b.name,
          'email', b.email,
          'phone', b.phone,
          'role', b.role,
          'status', b.status
        )
      )
      FROM users b
      WHERE b.tenant_id = t.id AND b.role IN ('owner', 'barber') AND b.status = 'active'
    )
  ) INTO v_result
  FROM tenants t
  LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'owner'
  WHERE t.slug = p_slug;

  IF v_result IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Barbería no encontrada',
      'message', 'No existe una barbería con el slug: ' || p_slug
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'data', v_result
  );
END;
$$;

-- =============================================================================
-- FUNCIÓN AUXILIAR: update_tenant_subscription
-- =============================================================================
-- Función para actualizar el estado de suscripción de un tenant

CREATE OR REPLACE FUNCTION update_tenant_subscription(
  p_tenant_id UUID,
  p_subscription_status VARCHAR(20),
  p_subscription_plan VARCHAR(20) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status VARCHAR(20);
  v_old_plan VARCHAR(20);
BEGIN
  -- Obtener valores actuales
  SELECT subscription_status, subscription_plan
  INTO v_old_status, v_old_plan
  FROM tenants
  WHERE id = p_tenant_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Tenant no encontrado'
    );
  END IF;

  -- Actualizar suscripción
  UPDATE tenants
  SET 
    subscription_status = p_subscription_status,
    subscription_plan = COALESCE(p_subscription_plan, subscription_plan),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_tenant_id;

  -- Registrar en audit_log
  INSERT INTO audit_log (
    id,
    tenant_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values
  ) VALUES (
    uuid_generate_v4(),
    p_tenant_id,
    'UPDATE',
    'tenants',
    p_tenant_id::text,
    json_build_object(
      'subscription_status', v_old_status,
      'subscription_plan', v_old_plan
    ),
    json_build_object(
      'subscription_status', p_subscription_status,
      'subscription_plan', COALESCE(p_subscription_plan, v_old_plan)
    )
  );

  RETURN json_build_object(
    'success', true,
    'message', 'Suscripción actualizada correctamente',
    'data', json_build_object(
      'tenant_id', p_tenant_id,
      'old_status', v_old_status,
      'new_status', p_subscription_status,
      'old_plan', v_old_plan,
      'new_plan', COALESCE(p_subscription_plan, v_old_plan)
    )
  );
END;
$$;

-- =============================================================================
-- EJEMPLOS DE USO
-- =============================================================================

-- Crear una nueva barbería:
/*
SELECT provision_tenant(
  'mi-barberia',
  'Mi Barbería',
  'La mejor barbería del barrio',
  'owner@mibarberia.com',
  'Juan Pérez',
  '+56912345678',
  'contacto@mibarberia.com',
  '+56912345678',
  'Av. Principal 123, Santiago',
  '@mibarberia',
  '+56912345678',
  'basic'
);
*/

-- Obtener información de una barbería:
/*
SELECT get_tenant_info('mi-barberia');
*/

-- Actualizar suscripción:
/*
SELECT update_tenant_subscription(
  '550e8400-e29b-41d4-a716-446655440001',
  'active',
  'premium'
);
*/

SELECT 'Funciones de provisión de tenant creadas correctamente' as status;