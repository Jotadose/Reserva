import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar campos obligatorios
    const {
      tenant_id,
      service_id,
      provider_id,
      scheduled_date,
      scheduled_time,
      client_name,
      client_phone,
      client_email,
      notes,
      status = 'confirmed',
      total_price,
      duration_minutes
    } = body

    if (!tenant_id || !service_id || !provider_id || !scheduled_date || 
        !scheduled_time || !client_name || !client_phone || !total_price || !duration_minutes) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      )
    }

    // Usar el cliente admin para bypasear RLS
    const supabase = getSupabaseAdminClient()
    
    // Verificar que el tenant, service y provider existen
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenant_id)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      )
    }

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, price, duration_minutes')
      .eq('id', service_id)
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado o inactivo' },
        { status: 404 }
      )
    }

    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('id', provider_id)
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)
      .single()

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado o inactivo' },
        { status: 404 }
      )
    }

    // Crear la reserva
    const bookingData = {
      tenant_id,
      service_id,
      provider_id,
      scheduled_date,
      scheduled_time,
      client_name,
      client_phone,
      client_email: client_email || null,
      notes: notes || null,
      status,
      total_price,
      duration_minutes
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return NextResponse.json(
        { error: 'Error al crear la reserva: ' + bookingError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      booking
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}