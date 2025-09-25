import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, tenant, services, provider, plan } = body as {
      userId: string
      tenant: any
      services?: any[]
      provider?: any
      plan?: 'basic' | 'growth' | 'pro-multi' | 'enterprise'
    }

    if (!userId || !tenant?.slug || !tenant?.name) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    // Solo incluir campos que existen en el esquema real de la tabla
    const tenantData = {
      name: tenant.name,
      slug: tenant.slug,
      subscription_status: tenant.subscription_status ?? 'active',
      subscription_plan: plan ?? 'basic',
      contact_email: tenant.contact_email || null,
      contact_phone: tenant.contact_phone || null,
      slot_duration_minutes: tenant.slot_duration_minutes ?? 30,
      settings: {
        // Guardar campos adicionales como JSON en settings
        description: tenant.description || null,
        category: tenant.category || null,
        address: tenant.address || null,
        website: tenant.website || null,
        working_hours: tenant.working_hours || {},
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF'
        }
      },
      owner_id: userId
    }

    // 1) Crear tenant
    const { data: createdTenant, error: tErr } = await supabaseAdmin
      .from('tenants')
      .insert(tenantData)
      .select('*')
      .single()

    if (tErr) {
      return NextResponse.json({ error: 'No se pudo crear el tenant', details: tErr.message }, { status: 500 })
    }

    // 2) Crear servicios (si vienen y la tabla existe)
    if (services?.length) {
      try {
        const bulk = services
          .filter(s => s?.name && Number(s?.price) > 0)
          .map(s => ({
            tenant_id: createdTenant.id,
            name: s.name,
            description: s.description ?? null,
            duration_minutes: s.duration ?? s.duration_minutes ?? 30,
            price: Number(s.price),
            is_active: true,
          }))

        if (bulk.length) {
          await supabaseAdmin
            .from('services')
            .insert(bulk)
        }
      } catch (sErr) {
        console.warn('Tabla services no existe o error insertando servicios:', sErr)
      }
    }

    // 3) Intentar crear registros adicionales (opcional, no rompe si fallan)
    try {
      // Asegurar registro de usuario en public.users (si la tabla existe)
      await supabaseAdmin
        .from('users')
        .upsert({
          tenant_id: createdTenant.id,
          auth_user_id: userId,
          name: tenantData.contact_email ?? null,
          email: tenantData.contact_email ?? null,
          role: 'owner',
          is_active: true,
        }, { onConflict: 'tenant_id,auth_user_id' })
    } catch (uErr) {
      console.warn('Tabla users no existe, saltando...', uErr)
    }

    try {
      // Crear provider principal (si la tabla existe)
      await supabaseAdmin
        .from('providers')
        .insert({
          tenant_id: createdTenant.id,
          user_id: userId,
          role: provider?.role ?? 'owner',
          is_active: true,
        })
    } catch (pErr) {
      console.warn('Tabla providers no existe, saltando...', pErr)
    }

    try {
      // Auditoría (si la tabla existe)
      await supabaseAdmin.from('audit_log').insert({
        tenant_id: createdTenant.id,
        user_id: userId,
        entity_type: 'tenant',
        entity_id: createdTenant.id,
        action: 'onboarding_completed',
        new_values: createdTenant,
      })
    } catch (aErr) {
      console.warn('Tabla audit_log no existe, saltando...', aErr)
    }

    return NextResponse.json({ tenant: createdTenant })
  } catch (e: any) {
    return NextResponse.json({ error: 'Error inesperado', details: e?.message }, { status: 500 })
  }
}
