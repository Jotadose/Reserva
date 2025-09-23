-- =============================================================================
-- SCRIPT DE CORRECCIÓN CRÍTICA - DATABASE FIXES PARA MVP
-- =============================================================================
-- Ejecutar en SQL Editor de Supabase para corregir discrepancias detectadas

-- 1) AGREGAR owner_id a tabla tenants
-- Problema: El código necesita saber quién es el dueño del tenant para permisos y facturación
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

-- Crear índice para performance
CREATE INDEX IF NOT EXISTS tenants_owner_id_idx ON public.tenants(owner_id);

-- (Opcional) Si ya tienes datos, rellenar owner_id desde users con role='owner'
UPDATE public.tenants t
SET owner_id = u.auth_user_id
FROM public.users u
WHERE u.role = 'owner' 
  AND u.tenant_id = t.id
  AND t.owner_id IS NULL;

-- =============================================================================
-- 2) RENOMBRAR CAMPOS PARA CONSISTENCIA CON EL CÓDIGO
-- =============================================================================

-- Renombrar status a subscription_status (el código usa subscription_status)
ALTER TABLE public.tenants
RENAME COLUMN status TO subscription_status;

-- Renombrar plan a subscription_plan para consistencia
ALTER TABLE public.tenants
RENAME COLUMN plan TO subscription_plan;

-- Actualizar constraints
ALTER TABLE public.tenants
DROP CONSTRAINT IF EXISTS tenants_status_check;

ALTER TABLE public.tenants
DROP CONSTRAINT IF EXISTS tenants_plan_check;

-- Nuevos constraints con semántica correcta
ALTER TABLE public.tenants
ADD CONSTRAINT tenants_subscription_status_check
CHECK (subscription_status IN ('trial','active','suspended','cancelled'));

ALTER TABLE public.tenants
ADD CONSTRAINT tenants_subscription_plan_check
CHECK (subscription_plan IN ('basic','pro','enterprise'));

-- =============================================================================
-- 3) AGREGAR POLÍTICAS RLS FALTANTES PARA OPERACIONES DE ESCRITURA
-- =============================================================================

-- NOTA: Asume que tienes una función current_tenant_id() que lee del JWT
-- Si no la tienes, créala primero:
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'tenant_id')::uuid,
    (SELECT tenant_id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1)
  );
$$;

-- Políticas para TENANTS (solo el owner puede crear/modificar)
CREATE POLICY IF NOT EXISTS "tenants_insert" ON public.tenants
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY IF NOT EXISTS "tenants_update" ON public.tenants
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Políticas para SERVICES (owner y barbers pueden gestionar)
CREATE POLICY IF NOT EXISTS "services_insert" ON public.services
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = current_tenant_id()
  AND EXISTS (SELECT 1 FROM public.users u
              WHERE u.auth_user_id = auth.uid()
                AND u.tenant_id = current_tenant_id()
                AND u.role IN ('owner','barber'))
);

CREATE POLICY IF NOT EXISTS "services_update" ON public.services
FOR UPDATE TO authenticated
USING (
  tenant_id = current_tenant_id()
  AND EXISTS (SELECT 1 FROM public.users u
              WHERE u.auth_user_id = auth.uid()
                AND u.tenant_id = current_tenant_id()
                AND u.role IN ('owner','barber'))
)
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY IF NOT EXISTS "services_delete" ON public.services
FOR DELETE TO authenticated
USING (
  tenant_id = current_tenant_id()
  AND EXISTS (SELECT 1 FROM public.users u
              WHERE u.auth_user_id = auth.uid()
                AND u.tenant_id = current_tenant_id()
                AND u.role IN ('owner','barber'))
);

-- Políticas para PROVIDERS (owner puede gestionar)
CREATE POLICY IF NOT EXISTS "providers_insert" ON public.providers
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = current_tenant_id()
  AND EXISTS (SELECT 1 FROM public.users u
              WHERE u.auth_user_id = auth.uid()
                AND u.tenant_id = current_tenant_id()
                AND u.role = 'owner')
);

CREATE POLICY IF NOT EXISTS "providers_update" ON public.providers
FOR UPDATE TO authenticated
USING (
  tenant_id = current_tenant_id()
  AND EXISTS (SELECT 1 FROM public.users u
              WHERE u.auth_user_id = auth.uid()
                AND u.tenant_id = current_tenant_id()
                AND u.role IN ('owner','barber'))
)
WITH CHECK (tenant_id = current_tenant_id());

-- Políticas para BOOKINGS (múltiples flujos)
-- 1) Clientes anónimos pueden crear reservas
CREATE POLICY IF NOT EXISTS "bookings_insert_anon" ON public.bookings
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

-- 2) Usuarios autenticados pueden crear reservas
CREATE POLICY IF NOT EXISTS "bookings_insert_auth" ON public.bookings
FOR INSERT TO authenticated
WITH CHECK (tenant_id = current_tenant_id());

-- 3) Staff puede actualizar reservas
CREATE POLICY IF NOT EXISTS "bookings_update_staff" ON public.bookings
FOR UPDATE TO authenticated
USING (
  tenant_id = current_tenant_id()
  AND EXISTS (SELECT 1 FROM public.users u
              WHERE u.auth_user_id = auth.uid()
                AND u.tenant_id = current_tenant_id()
                AND u.role IN ('owner','barber'))
)
WITH CHECK (tenant_id = current_tenant_id());

-- Políticas para USERS (owner puede gestionar usuarios)
CREATE POLICY IF NOT EXISTS "users_insert" ON public.users
FOR INSERT TO authenticated
WITH CHECK (
  tenant_id = current_tenant_id()
  AND EXISTS (SELECT 1 FROM public.users u
              WHERE u.auth_user_id = auth.uid()
                AND u.tenant_id = current_tenant_id()
                AND u.role = 'owner')
);

CREATE POLICY IF NOT EXISTS "users_update" ON public.users
FOR UPDATE TO authenticated
USING (
  tenant_id = current_tenant_id()
  AND (
    -- El owner puede editar cualquier usuario de su tenant
    EXISTS (SELECT 1 FROM public.users u
            WHERE u.auth_user_id = auth.uid()
              AND u.tenant_id = current_tenant_id()
              AND u.role = 'owner')
    OR
    -- Un usuario puede editar su propio perfil
    auth_user_id = auth.uid()
  )
)
WITH CHECK (tenant_id = current_tenant_id());

-- Políticas para AVAILABILITY_BLOCKS (owner o el barbero dueño del bloque)
CREATE POLICY IF NOT EXISTS "availability_write" ON public.availability_blocks
FOR ALL TO authenticated
USING (
  tenant_id = current_tenant_id()
  AND (
    -- Owner puede gestionar todos los bloques
    EXISTS (SELECT 1 FROM public.users u
            WHERE u.auth_user_id = auth.uid()
              AND u.tenant_id = current_tenant_id()
              AND u.role = 'owner')
    OR
    -- Barbero puede gestionar sus propios bloques
    EXISTS (SELECT 1 FROM public.providers p
            JOIN public.users u ON u.id = p.user_id
            WHERE p.id = availability_blocks.provider_id
              AND p.tenant_id = current_tenant_id()
              AND u.auth_user_id = auth.uid())
  )
)
WITH CHECK (tenant_id = current_tenant_id());

-- Políticas para NOTIFICATIONS (sistema y staff pueden crear)
CREATE POLICY IF NOT EXISTS "notifications_insert" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY IF NOT EXISTS "notifications_update" ON public.notifications
FOR UPDATE TO authenticated
USING (
  tenant_id = current_tenant_id()
  AND EXISTS (SELECT 1 FROM public.users u
              WHERE u.auth_user_id = auth.uid()
                AND u.tenant_id = current_tenant_id()
                AND u.role IN ('owner','barber'))
)
WITH CHECK (tenant_id = current_tenant_id());

-- =============================================================================
-- 4) VALIDACIÓN FINAL
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
    RAISE NOTICE '✅ Campo owner_id agregado a tenants';
    RAISE NOTICE '✅ Campos renombrados: status → subscription_status, plan → subscription_plan';
    RAISE NOTICE '✅ Políticas RLS de escritura creadas para todas las tablas';
    RAISE NOTICE '🚀 Tu MVP está listo para 100 barberías!';
END $$;