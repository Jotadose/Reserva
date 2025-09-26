-- ===============================================
-- ROLLBACK 001: REVERT TENANT ARCHITECTURE CHANGES
-- Author: Juan Emilio Elgueda Lillo
-- Date: 2025-09-26
-- Description: Safe rollback for migration_001_tenant_architecture.sql
-- WARNING: This will NOT delete tenant_memberships data by default (safety)
-- ===============================================

begin;

-- =====================
-- 1. REMOVE INVITATIONS
-- =====================

drop table if exists public.tenant_invitations cascade;

-- ====================
-- 2. REMOVE AUTO-MEMBERSHIP
-- ====================

drop trigger if exists trg_tenant_owner_membership on public.tenants;
drop function if exists public.add_owner_membership() cascade;

-- ================
-- 3. REMOVE RLS POLICIES
-- ================

-- Remove all policies we created (compatible with older PostgreSQL)
do $$
begin
  -- Bookings policies
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_select_same_tenant') then
    drop policy "bookings_select_same_tenant" on public.bookings;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_insert_members') then
    drop policy "bookings_insert_members" on public.bookings;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_update_role_or_owner_provider') then
    drop policy "bookings_update_role_or_owner_provider" on public.bookings;
  end if;

  -- Providers policies
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'providers' and policyname = 'providers_select_same_tenant') then
    drop policy "providers_select_same_tenant" on public.providers;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'providers' and policyname = 'providers_cud_admins') then
    drop policy "providers_cud_admins" on public.providers;
  end if;

  -- Clients policies
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'clients' and policyname = 'clients_select_same_tenant') then
    drop policy "clients_select_same_tenant" on public.clients;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'clients' and policyname = 'clients_cud_staff') then
    drop policy "clients_cud_staff" on public.clients;
  end if;

  -- Services policies (new ones we created)
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'services_select_same_tenant') then
    drop policy "services_select_same_tenant" on public.services;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'services_cud_admins') then
    drop policy "services_cud_admins" on public.services;
  end if;

  -- Availability blocks policies (new ones we created)
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'availability_blocks' and policyname = 'availability_select_same_tenant') then
    drop policy "availability_select_same_tenant" on public.availability_blocks;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'availability_blocks' and policyname = 'availability_cud_providers') then
    drop policy "availability_cud_providers" on public.availability_blocks;
  end if;

  -- Notifications policies (new ones we created)
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_select_same_tenant') then
    drop policy "notifications_select_same_tenant" on public.notifications;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_cud_staff') then
    drop policy "notifications_cud_staff" on public.notifications;
  end if;
end$$;

-- Disable RLS (optional - comment out if you want to keep RLS enabled)
-- alter table public.bookings disable row level security;
-- alter table public.providers disable row level security;
-- alter table public.clients disable row level security;

-- =================
-- 4. REMOVE RLS FUNCTION
-- =================

drop function if exists public.is_member(uuid, role_type[]) cascade;

-- ==================
-- 5. REVERT BOOKINGS CHANGES
-- ==================

-- Remove new columns from bookings
alter table if exists public.bookings drop column if exists client_source;
alter table if exists public.bookings drop column if exists anonymized_at;

-- Remove FK constraint to clients
alter table if exists public.bookings drop constraint if exists bookings_client_id_fkey;

-- ================
-- 6. REMOVE CLIENTS TABLE
-- ================

-- WARNING: This will delete all client data!
-- Comment out if you want to preserve client data
drop table if exists public.clients cascade;

-- ==================
-- 7. REVERT PROVIDERS FK
-- ==================

-- Note: We're NOT reverting the FK fix as the original was broken
-- The original FK pointed to auth.users which might not match production
-- If you REALLY need to revert this, uncomment and adjust:

-- alter table public.providers
--   drop constraint if exists providers_user_id_fkey;
-- 
-- alter table public.providers
--   add constraint providers_user_id_fkey
--   foreign key (user_id) references auth.users(id) on delete set null;

-- Remove uniqueness constraint
drop index if exists ux_providers_tenant_user;

-- =======================
-- 8. REMOVE TENANT MEMBERSHIPS
-- =======================

-- WARNING: Uncomment ONLY if you want to completely remove memberships data
-- This is commented by default for safety

-- drop table if exists public.tenant_memberships cascade;

-- If you want to keep the table but remove the structure improvements:
do $$
begin
  if exists (select 1 from information_schema.tables 
             where table_schema='public' and table_name='tenant_memberships') then
    
    -- Remove triggers
    drop trigger if exists trg_memberships_updated_at on public.tenant_memberships;
    
    -- Remove indexes
    drop index if exists ix_memberships_user_tenant;
    drop index if exists ix_memberships_tenant_role;
    drop index if exists ix_memberships_active;
    
    -- Remove added columns (keep core structure)
    alter table public.tenant_memberships drop column if exists is_active;
    alter table public.tenant_memberships drop column if exists invited_by;
    alter table public.tenant_memberships drop column if exists invited_at;
    alter table public.tenant_memberships drop column if exists accepted_at;
    alter table public.tenant_memberships drop column if exists updated_at;
    
  end if;
end$$;

-- =================
-- 9. REMOVE TYPES
-- =================

-- Note: Only drop if no other tables use these types
-- Check dependencies before uncommenting

-- drop type if exists client_source_type cascade;
-- drop type if exists role_type cascade;

-- ==================
-- 10. REMOVE FUNCTIONS
-- ==================

drop function if exists public.set_updated_at() cascade;

-- =================
-- 11. FINAL CLEANUP
-- =================

do $$
begin
  raise notice 'Rollback completed. Note: tenant_memberships table preserved for safety.';
  raise notice 'If you need to fully remove it, uncomment the appropriate section and re-run.';
end$$;

commit;