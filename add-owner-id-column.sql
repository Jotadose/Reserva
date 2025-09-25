-- Script para añadir la columna owner_id a la tabla tenants
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Añadir la columna owner_id si no existe
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

-- 2. Crear un índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS tenants_owner_id_idx ON tenants(owner_id);

-- 3. Si tienes tenants existentes sin owner_id, puedes asignarlos manualmente:
-- UPDATE tenants SET owner_id = 'tu-user-id-aqui' WHERE slug = 'agendex';
-- UPDATE tenants SET owner_id = 'tu-user-id-aqui' WHERE slug = 'agendex-1';

-- 4. Crear políticas RLS básicas para la columna owner_id
-- (Opcional: esto será útil cuando implementemos autenticación completa)

-- Política para que los usuarios solo vean sus propios tenants
-- DROP POLICY IF EXISTS "Users can view own tenants" ON tenants;
-- CREATE POLICY "Users can view own tenants" ON tenants FOR SELECT 
--   USING (auth.uid() = owner_id);

-- Política para que los usuarios solo puedan actualizar sus propios tenants  
-- DROP POLICY IF EXISTS "Users can update own tenants" ON tenants;
-- CREATE POLICY "Users can update own tenants" ON tenants FOR UPDATE 
--   USING (auth.uid() = owner_id);