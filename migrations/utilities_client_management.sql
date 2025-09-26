-- ===============================================
-- UTILITIES: CLIENT MANAGEMENT & GDPR FUNCTIONS
-- Author: Juan Emilio Elgueda Lillo
-- Date: 2025-09-26
-- Description: Helper functions for client deduplication and GDPR compliance
-- ===============================================

-- =====================
-- CLIENT DEDUPLICATION
-- =====================

-- Merge two client records, moving all bookings to the target client
-- Preserves booking snapshots for historical accuracy
create or replace function public.merge_clients(source_client_id uuid, target_client_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  source_tenant uuid;
  target_tenant uuid;
  bookings_moved integer;
begin
  -- Validate both clients exist and belong to same tenant
  select tenant_id into source_tenant from public.clients where id = source_client_id;
  select tenant_id into target_tenant from public.clients where id = target_client_id;
  
  if source_tenant is null then
    raise exception 'Source client % not found', source_client_id;
  end if;
  
  if target_tenant is null then
    raise exception 'Target client % not found', target_client_id;
  end if;
  
  if source_tenant != target_tenant then
    raise exception 'Cannot merge clients from different tenants';
  end if;
  
  -- Move all bookings from source to target
  update public.bookings
    set client_id = target_client_id
  where client_id = source_client_id;
  
  get diagnostics bookings_moved = row_count;
  
  -- Delete the source client record
  delete from public.clients where id = source_client_id;
  
  raise notice 'Merged client % into %. Moved % bookings.', source_client_id, target_client_id, bookings_moved;
end;
$$;

-- Find potential duplicate clients within a tenant
create or replace function public.find_duplicate_clients(p_tenant_id uuid)
returns table(
  group_key text,
  client_ids uuid[],
  names text[],
  emails text[],
  phones text[],
  booking_counts integer[]
)
language sql
stable
as $$
  -- Group by normalized email or phone
  with normalized_clients as (
    select 
      c.id,
      c.name,
      lower(trim(c.email)) as norm_email,
      regexp_replace(c.phone, '[^0-9]', '', 'g') as norm_phone,
      (select count(*) from public.bookings b where b.client_id = c.id) as booking_count
    from public.clients c
    where c.tenant_id = p_tenant_id
      and c.anonymized_at is null
  ),
  groups as (
    select
      coalesce(norm_email, norm_phone, 'no_contact') as group_key,
      array_agg(id) as client_ids,
      array_agg(name) as names,
      array_agg(norm_email) as emails,
      array_agg(norm_phone) as phones,
      array_agg(booking_count) as booking_counts
    from normalized_clients
    where norm_email is not null or norm_phone is not null
    group by coalesce(norm_email, norm_phone, 'no_contact')
    having count(*) > 1
  )
  select * from groups;
$$;

-- =================
-- GDPR COMPLIANCE
-- =================

-- Anonymize a client's personal data while preserving business analytics
create or replace function public.anonymize_client(p_client_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  client_tenant uuid;
  bookings_count integer;
begin
  -- Validate client exists
  select tenant_id into client_tenant from public.clients where id = p_client_id;
  
  if client_tenant is null then
    raise exception 'Client % not found', p_client_id;
  end if;
  
  -- Count affected bookings
  select count(*) into bookings_count 
  from public.bookings 
  where client_id = p_client_id;
  
  -- Anonymize client record
  update public.clients
    set name = 'Anonymized Client',
        email = null,
        phone = null,
        notes = null,
        marketing_consent = false,
        whatsapp_consent = false,
        anonymized_at = now()
  where id = p_client_id;
  
  -- Note: We preserve booking snapshots for business analytics
  -- If legal requirements demand it, uncomment the following:
  /*
  update public.bookings
    set client_name = 'Anonymized Client',
        client_email = null,
        client_phone = null,
        anonymized_at = now()
  where client_id = p_client_id
    and anonymized_at is null;
  */
  
  raise notice 'Anonymized client %. Affected bookings: % (snapshots preserved)', p_client_id, bookings_count;
end;
$$;

-- Bulk anonymize clients older than specified days with no recent bookings
create or replace function public.anonymize_inactive_clients(
  p_tenant_id uuid,
  p_days_inactive integer default 1095, -- 3 years default
  p_dry_run boolean default true
)
returns table(
  client_id uuid,
  client_name text,
  last_booking_date timestamptz,
  days_since_booking integer,
  action_taken text
)
language plpgsql
as $$
declare
  client_record record;
  clients_processed integer := 0;
begin
  for client_record in
    select 
      c.id,
      c.name,
      c.email,
      c.phone,
      max(b.scheduled_date) as last_booking_date
    from public.clients c
    left join public.bookings b on b.client_id = c.id
    where c.tenant_id = p_tenant_id
      and c.anonymized_at is null
    group by c.id, c.name, c.email, c.phone
    having max(b.scheduled_date) < (current_date - interval '1 day' * p_days_inactive)
       or max(b.scheduled_date) is null
  loop
    clients_processed := clients_processed + 1;
    
    client_id := client_record.id;
    client_name := client_record.name;
    last_booking_date := client_record.last_booking_date;
    days_since_booking := extract(days from (now() - coalesce(client_record.last_booking_date, now() - interval '10 years')));
    
    if p_dry_run then
      action_taken := 'DRY_RUN - Would anonymize';
    else
      perform public.anonymize_client(client_record.id);
      action_taken := 'ANONYMIZED';
    end if;
    
    return next;
  end loop;
  
  if p_dry_run then
    raise notice 'DRY RUN: Would anonymize % clients. Set p_dry_run=false to execute.', clients_processed;
  else
    raise notice 'Anonymized % inactive clients for tenant %', clients_processed, p_tenant_id;
  end if;
end;
$$;

-- ==================
-- PERMISSION HELPERS
-- ==================

-- Check if current user has specific role in tenant
create or replace function public.has_role_in_tenant(p_tenant_id uuid, p_role role_type)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.tenant_memberships m
    where m.tenant_id = p_tenant_id
      and m.user_id = auth.uid()
      and m.role = p_role
      and m.is_active = true
  );
$$;

-- Check if current user has any admin-level permissions in tenant
create or replace function public.is_admin_in_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.tenant_memberships m
    where m.tenant_id = p_tenant_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
      and m.is_active = true
  );
$$;

-- Get user's role in specific tenant
create or replace function public.get_user_role_in_tenant(p_tenant_id uuid)
returns role_type
language sql
stable
security definer
as $$
  select m.role
  from public.tenant_memberships m
  where m.tenant_id = p_tenant_id
    and m.user_id = auth.uid()
    and m.is_active = true;
$$;

-- ===================
-- AUDIT & REPORTING
-- ===================

-- Generate client data report for a tenant
create or replace function public.generate_client_report(p_tenant_id uuid)
returns table(
  total_clients bigint,
  active_clients bigint,
  anonymized_clients bigint,
  clients_with_bookings bigint,
  duplicate_groups bigint,
  avg_bookings_per_client numeric
)
language sql
stable
as $$
  select
    count(*) as total_clients,
    count(*) filter (where anonymized_at is null) as active_clients,
    count(*) filter (where anonymized_at is not null) as anonymized_clients,
    count(distinct b.client_id) as clients_with_bookings,
    (select count(*) from public.find_duplicate_clients(p_tenant_id)) as duplicate_groups,
    coalesce(avg(booking_counts.cnt), 0) as avg_bookings_per_client
  from public.clients c
  left join (
    select client_id, count(*) as cnt
    from public.bookings
    where client_id is not null
    group by client_id
  ) booking_counts on booking_counts.client_id = c.id
  left join public.bookings b on b.client_id = c.id
  where c.tenant_id = p_tenant_id;
$$;

-- =================
-- EXAMPLE USAGE
-- =================

/*
-- Find duplicates
select * from public.find_duplicate_clients('your-tenant-id-here');

-- Merge clients
select public.merge_clients('source-client-id', 'target-client-id');

-- Anonymize specific client
select public.anonymize_client('client-id-to-anonymize');

-- Dry run inactive client cleanup (3 years)
select * from public.anonymize_inactive_clients('your-tenant-id', 1095, true);

-- Actually execute inactive client cleanup
select * from public.anonymize_inactive_clients('your-tenant-id', 1095, false);

-- Check permissions
select public.has_role_in_tenant('tenant-id', 'admin');
select public.is_admin_in_tenant('tenant-id');
select public.get_user_role_in_tenant('tenant-id');

-- Generate report
select * from public.generate_client_report('your-tenant-id');
*/