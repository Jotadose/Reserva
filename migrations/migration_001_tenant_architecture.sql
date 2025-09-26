-- ===============================================
-- MIGRATION 001: TENANT ARCHITECTURE REDESIGN
-- Author: Juan Emilio Elgueda Lillo
-- Date: 2025-09-26
-- Description: Implement proper multi-tenant architecture with role-based memberships
-- ===============================================

begin;

-- ===================
-- 1. TYPES & FUNCTIONS
-- ===================

-- Create role types if they don't exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'role_type') then
    create type role_type as enum ('owner','admin','staff','provider','viewer');
  end if;

  if not exists (select 1 from pg_type where typname = 'client_source_type') then
    create type client_source_type as enum ('guest','registered','imported');
  end if;
end$$;

-- Generic function for updated_at triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================
-- 2. TENANT MEMBERSHIPS
-- =====================

-- Create tenant_memberships table (single role per user per tenant)
create table if not exists public.tenant_memberships (
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  role        role_type not null,
  is_active   boolean not null default true,
  invited_by  uuid null references public.users(id) on delete set null,
  invited_at  timestamptz null,
  accepted_at timestamptz null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

-- Performance indexes for RLS queries
create index if not exists ix_memberships_user_tenant on public.tenant_memberships(user_id, tenant_id);
create index if not exists ix_memberships_tenant_role on public.tenant_memberships(tenant_id, role);
create index if not exists ix_memberships_active on public.tenant_memberships(tenant_id, is_active);

-- Auto-update timestamp trigger
create trigger trg_memberships_updated_at
  before update on public.tenant_memberships
  for each row execute function public.set_updated_at();

-- =================
-- 3. PROVIDERS FIX
-- =================

-- Fix providers FK to point to public.users instead of auth.users
alter table public.providers
  drop constraint if exists providers_user_id_fkey;

alter table public.providers
  add constraint providers_user_id_fkey
  foreign key (user_id) references public.users(id) on delete set null;

-- Ensure uniqueness: one user can't have multiple provider records in same tenant
create unique index if not exists ux_providers_tenant_user
  on public.providers(tenant_id, user_id)
  where user_id is not null;

-- =================
-- 4. DATA BACKFILL
-- =================

-- Backfill memberships from existing providers (assign 'provider' role)
insert into public.tenant_memberships (tenant_id, user_id, role)
select distinct p.tenant_id, p.user_id, 'provider'::role_type
from public.providers p
where p.user_id is not null
on conflict do nothing;

-- Backfill owners if tenants.owner_user_id exists
do $$
begin
  if exists (select 1 from information_schema.columns 
             where table_schema='public' and table_name='tenants' and column_name='owner_user_id') then
    insert into public.tenant_memberships (tenant_id, user_id, role)
    select t.id, t.owner_user_id, 'owner'::role_type
    from public.tenants t
    where t.owner_user_id is not null
    on conflict do nothing;
  end if;
end$$;

-- ==================
-- 5. CLEANUP OLD ROLES
-- ==================

-- First, remove existing RLS policies that depend on users.role and providers.role
do $$
begin
  -- Drop existing policies that use users.role
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'services_insert') then
    drop policy "services_insert" on public.services;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'services_update') then
    drop policy "services_update" on public.services;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_update_staff') then
    drop policy "bookings_update_staff" on public.bookings;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'availability_blocks' and policyname = 'avail_write') then
    drop policy "avail_write" on public.availability_blocks;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'providers' and policyname = 'providers_insert') then
    drop policy "providers_insert" on public.providers;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'providers' and policyname = 'providers_update') then
    drop policy "providers_update" on public.providers;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_update') then
    drop policy "notifications_update" on public.notifications;
  end if;
  
  -- Drop any other existing policies that might conflict
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_select') then
    drop policy "bookings_select" on public.bookings;
  end if;
  
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'providers' and policyname = 'providers_select') then
    drop policy "providers_select" on public.providers;
  end if;
end$$;

-- Remove duplicate role columns (source of truth is now tenant_memberships)
alter table if exists public.providers drop column if exists role;
alter table if exists public.users drop column if exists role;

-- ==============
-- 6. CLIENTS TABLE
-- ==============

-- Create clients table for persistent customer data
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text,
  marketing_consent boolean not null default false,
  whatsapp_consent boolean not null default false,
  user_id uuid null references public.users(id) on delete set null,
  anonymized_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for lookups
create index if not exists ix_clients_tenant_email on public.clients(tenant_id, email);
create index if not exists ix_clients_tenant_phone on public.clients(tenant_id, phone);

-- Unique constraints to prevent duplicates within tenant
create unique index if not exists ux_clients_tenant_email_unique
  on public.clients(tenant_id, email)
  where email is not null and email <> '';

create unique index if not exists ux_clients_tenant_phone_unique
  on public.clients(tenant_id, phone)
  where phone is not null and phone <> '';

-- Auto-update timestamp trigger
create trigger trg_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ==================
-- 7. BOOKINGS UPDATES
-- ==================

-- Add FK to clients table (optional reference)
alter table public.bookings
  drop constraint if exists bookings_client_id_fkey;

alter table public.bookings
  add constraint bookings_client_id_fkey
  foreign key (client_id) references public.clients(id) on delete set null;

-- Add RGPD and source tracking fields
do $$
begin
  if not exists (select 1 from information_schema.columns 
                 where table_schema='public' and table_name='bookings' and column_name='client_source') then
    alter table public.bookings add column client_source client_source_type not null default 'guest';
  end if;

  if not exists (select 1 from information_schema.columns 
                 where table_schema='public' and table_name='bookings' and column_name='anonymized_at') then
    alter table public.bookings add column anonymized_at timestamptz null;
  end if;
end$$;

-- ===============
-- 8. RLS FUNCTION
-- ===============

-- Centralized membership check function for RLS
create or replace function public.is_member(target_tenant uuid, roles role_type[] default null)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.tenant_memberships m
    where m.tenant_id = target_tenant
      and m.user_id = auth.uid()
      and m.is_active = true
      and (roles is null or m.role = any(roles))
  );
$$;

-- =============
-- 9. RLS POLICIES
-- =============

-- Enable RLS on all multi-tenant tables
alter table public.bookings  enable row level security;
alter table public.providers enable row level security;
alter table public.clients   enable row level security;

-- BOOKINGS POLICIES
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_select_same_tenant') then
    create policy "bookings_select_same_tenant"
      on public.bookings for select
      using (public.is_member(tenant_id, null));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_insert_members') then
    create policy "bookings_insert_members"
      on public.bookings for insert
      with check (public.is_member(tenant_id, array['owner','admin','staff','provider']::role_type[]));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'bookings' and policyname = 'bookings_update_role_or_owner_provider') then
    create policy "bookings_update_role_or_owner_provider"
      on public.bookings for update
      using (
        public.is_member(tenant_id, array['owner','admin']::role_type[])
        or (
          public.is_member(tenant_id, array['provider']::role_type[])
          and exists (
            select 1
            from public.providers p
            where p.id = public.bookings.provider_id
              and p.user_id = auth.uid()
          )
        )
      )
      with check (
        public.is_member(tenant_id, array['owner','admin']::role_type[])
        or (
          public.is_member(tenant_id, array['provider']::role_type[])
          and exists (
            select 1
            from public.providers p
            where p.id = public.bookings.provider_id
              and p.user_id = auth.uid()
          )
        )
      );
  end if;
end$$;

-- PROVIDERS POLICIES
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'providers' and policyname = 'providers_select_same_tenant') then
    create policy "providers_select_same_tenant"
      on public.providers for select
      using (public.is_member(tenant_id, null));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'providers' and policyname = 'providers_cud_admins') then
    create policy "providers_cud_admins"
      on public.providers for all
      using (public.is_member(tenant_id, array['owner','admin']::role_type[]))
      with check (public.is_member(tenant_id, array['owner','admin']::role_type[]));
  end if;
end$$;

-- CLIENTS POLICIES
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'clients' and policyname = 'clients_select_same_tenant') then
    create policy "clients_select_same_tenant"
      on public.clients for select
      using (public.is_member(tenant_id, null));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'clients' and policyname = 'clients_cud_staff') then
    create policy "clients_cud_staff"
      on public.clients for all
      using (public.is_member(tenant_id, array['owner','admin','staff']::role_type[]))
      with check (public.is_member(tenant_id, array['owner','admin','staff']::role_type[]));
  end if;
end$$;

-- SERVICES POLICIES (replacing the old ones)
do $$
begin
  -- Enable RLS on services if not already enabled
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'services' and rowsecurity = true) then
    alter table public.services enable row level security;
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'services_select_same_tenant') then
    create policy "services_select_same_tenant"
      on public.services for select
      using (public.is_member(tenant_id, null));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'services' and policyname = 'services_cud_admins') then
    create policy "services_cud_admins"
      on public.services for all
      using (public.is_member(tenant_id, array['owner','admin']::role_type[]))
      with check (public.is_member(tenant_id, array['owner','admin']::role_type[]));
  end if;
end$$;

-- AVAILABILITY_BLOCKS POLICIES (replacing the old ones)
do $$
begin
  -- Enable RLS on availability_blocks if not already enabled
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'availability_blocks' and rowsecurity = true) then
    alter table public.availability_blocks enable row level security;
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'availability_blocks' and policyname = 'availability_select_same_tenant') then
    create policy "availability_select_same_tenant"
      on public.availability_blocks for select
      using (public.is_member(tenant_id, null));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'availability_blocks' and policyname = 'availability_cud_providers') then
    create policy "availability_cud_providers"
      on public.availability_blocks for all
      using (
        public.is_member(tenant_id, array['owner','admin']::role_type[])
        or (
          public.is_member(tenant_id, array['provider']::role_type[])
          and exists (
            select 1
            from public.providers p
            where p.id = public.availability_blocks.provider_id
              and p.user_id = auth.uid()
          )
        )
      )
      with check (
        public.is_member(tenant_id, array['owner','admin']::role_type[])
        or (
          public.is_member(tenant_id, array['provider']::role_type[])
          and exists (
            select 1
            from public.providers p
            where p.id = public.availability_blocks.provider_id
              and p.user_id = auth.uid()
          )
        )
      );
  end if;
end$$;

-- NOTIFICATIONS POLICIES (replacing the old ones)
do $$
begin
  -- Enable RLS on notifications if not already enabled
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'notifications' and rowsecurity = true) then
    alter table public.notifications enable row level security;
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_select_same_tenant') then
    create policy "notifications_select_same_tenant"
      on public.notifications for select
      using (public.is_member(tenant_id, null));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'notifications' and policyname = 'notifications_cud_staff') then
    create policy "notifications_cud_staff"
      on public.notifications for all
      using (public.is_member(tenant_id, array['owner','admin','staff']::role_type[]))
      with check (public.is_member(tenant_id, array['owner','admin','staff']::role_type[]));
  end if;
end$$;

-- ==================
-- 10. AUTO-MEMBERSHIP
-- ==================

-- Auto-create owner membership when tenant is created
do $$
begin
  if exists (select 1 from information_schema.columns 
             where table_schema='public' and table_name='tenants' and column_name='owner_user_id')
     and not exists (select 1 from information_schema.triggers 
                     where event_object_table='tenants' and trigger_name='trg_tenant_owner_membership') then

    create or replace function public.add_owner_membership()
    returns trigger
    language plpgsql
    as $fn$
    begin
      if new.owner_user_id is not null then
        insert into public.tenant_memberships(tenant_id, user_id, role)
        values (new.id, new.owner_user_id, 'owner')
        on conflict do nothing;
      end if;
      return new;
    end;
    $fn$;

    create trigger trg_tenant_owner_membership
      after insert on public.tenants
      for each row execute function public.add_owner_membership();
  end if;
end$$;

-- ===============
-- 11. INVITATIONS
-- ===============

-- Simple invitations table for users who don't exist yet
create table if not exists public.tenant_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  role role_type not null,
  token text not null,
  invited_by uuid null references public.users(id) on delete set null,
  invited_at timestamptz not null default now(),
  expires_at timestamptz not null,
  accepted_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists ix_invites_tenant_email on public.tenant_invitations(tenant_id, email);

-- =================
-- 12. FINAL VALIDATION
-- =================

-- Quick sanity checks
do $$
declare
  orphaned_providers integer;
  missing_memberships integer;
begin
  -- Check for providers with invalid user_id references
  select count(*) into orphaned_providers
  from public.providers p
  left join public.users u on u.id = p.user_id
  where p.user_id is not null and u.id is null;
  
  if orphaned_providers > 0 then
    raise warning 'Found % providers with invalid user_id references', orphaned_providers;
  end if;

  -- Check for users without proper memberships
  select count(*) into missing_memberships
  from public.providers p
  left join public.tenant_memberships m on m.tenant_id = p.tenant_id and m.user_id = p.user_id
  where p.user_id is not null and m.user_id is null;
  
  if missing_memberships > 0 then
    raise warning 'Found % providers without corresponding memberships', missing_memberships;
  end if;

  raise notice 'Migration completed successfully. Orphaned providers: %, Missing memberships: %', orphaned_providers, missing_memberships;
end$$;

commit;