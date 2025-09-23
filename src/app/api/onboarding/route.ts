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

    // Garantizar estado activo si no viene
    const tenantData = {
      ...tenant,
      subscription_status: tenant.subscription_status ?? tenant.status ?? 'active',
      status: tenant.status ?? 'active',
      subscription_plan: plan ?? tenant.subscription_plan ?? 'basic',
      owner_id: userId,
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

    // 2) Crear servicios (si vienen)
    if (services?.length) {
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
        const { error: sErr } = await supabaseAdmin
          .from('services')
          .insert(bulk)

        if (sErr) {
          // No detenemos el flujo, pero lo reportamos
          console.warn('Error creando servicios:', sErr)
        }
      }
    }

    // 3) Asegurar registro de usuario en public.users (opcional pero útil para joins)
    const { error: uErr } = await supabaseAdmin
      .from('users')
      .upsert({
        tenant_id: createdTenant.id,
        auth_user_id: userId,
        name: tenantData.owner_name ?? null,
        email: tenantData.contact_email ?? null,
        role: 'owner',
        is_active: true,
      }, { onConflict: 'tenant_id,auth_user_id' })
    if (uErr) {
      console.warn('Error creando/actualizando usuario público:', uErr)
    }

    // 4) Crear provider principal (dueño)
    const providerData = {
      tenant_id: createdTenant.id,
      user_id: userId,
      role: provider?.role ?? 'owner',
      is_active: true,
    }
    const { error: pErr } = await supabaseAdmin
      .from('providers')
      .insert(providerData)

    if (pErr) {
      console.warn('Error creando provider:', pErr)
    }

    // Auditoría
    await supabaseAdmin.from('audit_log').insert({
      tenant_id: createdTenant.id,
      user_id: userId,
      entity_type: 'tenant',
      entity_id: createdTenant.id,
      action: 'onboarding_completed',
      new_values: createdTenant,
    })

    return NextResponse.json({ tenant: createdTenant })
  } catch (e: any) {
    return NextResponse.json({ error: 'Error inesperado', details: e?.message }, { status: 500 })
  }
}
