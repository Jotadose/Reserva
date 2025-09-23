-- ==============================
-- Agendex: Fixes de esquema + RLS
-- Mercado objetivo: Chile (CLP)
-- ==============================

-- 1) owner_id directo a auth.users para RLS simple
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

UPDATE public.tenants t
SET owner_id = u.auth_user_id
FROM public.users u
WHERE u.role = 'owner' AND u.tenant_id = t.id
  AND t.owner_id IS NULL;

-- 2) Normalizar suscripción
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.tenants RENAME COLUMN status TO subscription_status;
  END IF;
END $$;

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS subscription_status text;

ALTER TABLE public.tenants
DROP CONSTRAINT IF EXISTS tenants_subscription_status_check;

ALTER TABLE public.tenants
ADD CONSTRAINT tenants_subscription_status_check
CHECK (subscription_status IN ('trial','active','suspended','cancelled'));

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS subscription_plan text
  CHECK (subscription_plan IN ('basic','growth','pro-multi','enterprise'))
  DEFAULT 'basic';

-- 3) Helper para tenant_id desde JWT
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id','')::uuid;
$$ LANGUAGE sql STABLE;

-- 4) Políticas de escritura mínimas
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- services
DROP POLICY IF EXISTS services_insert ON public.services;
CREATE POLICY services_insert ON public.services
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = public.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = public.current_tenant_id()
      AND u.role IN ('owner','barber')
  )
);

DROP POLICY IF EXISTS services_update ON public.services;
CREATE POLICY services_update ON public.services
FOR UPDATE TO authenticated
USING (
  tenant_id = public.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = public.current_tenant_id()
      AND u.role IN ('owner','barber')
  )
)
WITH CHECK (tenant_id = public.current_tenant_id());

-- bookings (inserción por auth; habilitar anon si se requiere)
DROP POLICY IF EXISTS bookings_insert_auth ON public.bookings;
CREATE POLICY bookings_insert_auth ON public.bookings
FOR INSERT TO authenticated
WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS bookings_update_staff ON public.bookings;
CREATE POLICY bookings_update_staff ON public.bookings
FOR UPDATE TO authenticated
USING (
  tenant_id = public.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = public.current_tenant_id()
      AND u.role IN ('owner','barber')
  )
)
WITH CHECK (tenant_id = public.current_tenant_id());

-- availability_blocks
DROP POLICY IF EXISTS avail_write ON public.availability_blocks;
CREATE POLICY avail_write ON public.availability_blocks
FOR ALL TO authenticated
USING (
  tenant_id = public.current_tenant_id()
  AND (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.auth_user_id = auth.uid()
        AND u.tenant_id = public.current_tenant_id()
        AND u.role = 'owner'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.providers p
      JOIN public.users u ON u.id = p.user_id
      WHERE p.id = availability_blocks.provider_id
        AND p.tenant_id = public.current_tenant_id()
        AND u.auth_user_id = auth.uid()
    )
  )
)
WITH CHECK (tenant_id = public.current_tenant_id());

-- notifications
DROP POLICY IF EXISTS notif_write ON public.notifications;
CREATE POLICY notif_write ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (tenant_id = public.current_tenant_id());

-- 5) Auditoría simple (si no existe)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid,
  entity_type text,
  entity_id uuid,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_insert ON public.audit_log;
CREATE POLICY audit_insert ON public.audit_log
FOR INSERT TO authenticated
WITH CHECK (tenant_id = public.current_tenant_id());
-- =============================================================================
-- COMPLEMENTOS: RLS TENANTS/PROVIDERS + BOOKINGS ANON + VALIDACIÓN
-- =============================================================================

-- Índice recomendado para owner_id (si no se creó antes)
CREATE INDEX IF NOT EXISTS tenants_owner_id_idx ON public.tenants(owner_id);

-- Asegurar RLS habilitado
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Políticas para TENANTS (solo el owner puede crear/modificar)
DROP POLICY IF EXISTS tenants_insert ON public.tenants;
CREATE POLICY tenants_insert ON public.tenants
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS tenants_update ON public.tenants;
CREATE POLICY tenants_update ON public.tenants
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Políticas para PROVIDERS (owner puede gestionar)
DROP POLICY IF EXISTS providers_insert ON public.providers;
CREATE POLICY providers_insert ON public.providers
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = public.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = public.current_tenant_id()
      AND u.role = 'owner'
  )
);

DROP POLICY IF EXISTS providers_update ON public.providers;
CREATE POLICY providers_update ON public.providers
FOR UPDATE TO authenticated
USING (
  tenant_id = public.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = public.current_tenant_id()
      AND u.role IN ('owner','barber')
  )
)
WITH CHECK (tenant_id = public.current_tenant_id());

-- Políticas para BOOKINGS (añadir inserción anónima opcional)
DROP POLICY IF EXISTS bookings_insert_anon ON public.bookings;
CREATE POLICY bookings_insert_anon ON public.bookings
FOR INSERT TO anon
WITH CHECK (
  client_name IS NOT NULL
  AND (client_email IS NOT NULL OR client_phone IS NOT NULL)
  AND EXISTS (
    SELECT 1 FROM public.providers p
    JOIN public.services s ON s.tenant_id = p.tenant_id
    WHERE p.id = bookings.provider_id
      AND s.id = bookings.service_id
      AND p.tenant_id = bookings.tenant_id
  )
);

-- Políticas para NOTIFICATIONS (update por staff)
DROP POLICY IF EXISTS notifications_update ON public.notifications;
CREATE POLICY notifications_update ON public.notifications
FOR UPDATE TO authenticated
USING (
  tenant_id = public.current_tenant_id()
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
      AND u.tenant_id = public.current_tenant_id()
      AND u.role IN ('owner','barber')
  )
)
WITH CHECK (tenant_id = public.current_tenant_id());

-- =============================================================================
-- VALIDACIÓN FINAL
-- =============================================================================

-- Verificar que todas las tablas tienen RLS habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tenants','users','providers','services','bookings','availability_blocks','notifications','audit_log');

-- Mostrar resumen de políticas creadas
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- =============================================================================
-- MENSAJE DE FINALIZACIÓN
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database fixes aplicados exitosamente!';
    RAISE NOTICE '✅ Campo owner_id (e índice) listo en tenants';
    RAISE NOTICE '✅ Políticas RLS de escritura creadas/actualizadas para tenants, providers, bookings (anon), notifications';
    RAISE NOTICE '🚀 Tu MVP está listo para 100 barberías!';
END $$;

-- =============================================================================
-- HARDENING: limpiar políticas demasiado amplias y crear SELECT públicos seguros
-- =============================================================================

-- USERS: remover políticas públicas (no exponer usuarios)
DROP POLICY IF EXISTS users_all ON public.users;
DROP POLICY IF EXISTS users_select ON public.users;
DROP POLICY IF EXISTS tenant_users_select ON public.users;

-- PROVIDERS: remover políticas amplias y dejar solo SELECT público acotado
DROP POLICY IF EXISTS providers_all ON public.providers;
DROP POLICY IF EXISTS providers_select ON public.providers;
DROP POLICY IF EXISTS providers_select_public ON public.providers;
CREATE POLICY providers_select_public ON public.providers
FOR SELECT TO public
USING (tenant_id IS NOT NULL);
-- Nota: si existe columna status, reemplazar la condición por (status = 'active')

-- SERVICES: remover write/select antiguos y exponer solo servicios activos
DROP POLICY IF EXISTS services_write ON public.services;
DROP POLICY IF EXISTS services_select ON public.services;
DROP POLICY IF EXISTS services_select_public ON public.services;
CREATE POLICY services_select_public ON public.services
FOR SELECT TO public
USING (is_active = true);

-- BOOKINGS: NO lecturas públicas
DROP POLICY IF EXISTS bookings_all ON public.bookings;
DROP POLICY IF EXISTS bookings_select ON public.bookings;
DROP POLICY IF EXISTS tenant_bookings_select ON public.bookings;

-- NOTIFICATIONS: NO políticas públicas
DROP POLICY IF EXISTS notifications_all ON public.notifications;
DROP POLICY IF EXISTS notif_select ON public.notifications;

-- AVAILABILITY_BLOCKS: remover políticas públicas amplias; SELECT público opcional
DROP POLICY IF EXISTS availability_all ON public.availability_blocks;
DROP POLICY IF EXISTS avail_select ON public.availability_blocks;
DROP POLICY IF EXISTS availability_select_public ON public.availability_blocks;
CREATE POLICY availability_select_public ON public.availability_blocks
FOR SELECT TO public
USING (tenant_id IS NOT NULL);
-- Nota: si agregas flags (ej. is_published), úsalo aquí para acotar visibilidad.

-- AUDIT_LOG: no exposición pública
DROP POLICY IF EXISTS audit_select ON public.audit_log;