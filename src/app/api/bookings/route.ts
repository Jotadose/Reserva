import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API Bookings: Recibida solicitud POST')
    const body = await request.json()
    console.log('📦 API Bookings: Body recibido:', body)
    
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

    console.log('🔍 API Bookings: Validando campos obligatorios...')
    if (!tenant_id || !service_id || !scheduled_date || 
        !scheduled_time || !client_name || !client_phone || !total_price || !duration_minutes) {
      const missingFields = []
      if (!tenant_id) missingFields.push('tenant_id')
      if (!service_id) missingFields.push('service_id')
      if (!scheduled_date) missingFields.push('scheduled_date')
      if (!scheduled_time) missingFields.push('scheduled_time')
      if (!client_name) missingFields.push('client_name')
      if (!client_phone) missingFields.push('client_phone')
      if (!total_price) missingFields.push('total_price')
      if (!duration_minutes) missingFields.push('duration_minutes')
      
      console.log('❌ API Bookings: Campos faltantes:', missingFields)
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: ' + missingFields.join(', ') },
        { status: 400 }
      )
    }

    // Usar el cliente admin para bypasear RLS
    console.log('🔧 API Bookings: Obteniendo cliente admin de Supabase...')
    const supabase = getSupabaseAdminClient()
    
    // Verificar que el tenant, service y provider existen
    console.log('🔍 API Bookings: Verificando tenant:', tenant_id)
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('id', tenant_id)
      .single()

    if (tenantError || !tenant) {
      console.log('❌ API Bookings: Error con tenant:', { tenantError, tenant })
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      )
    }
    console.log('✅ API Bookings: Tenant encontrado:', tenant)

    // Si no se proporciona provider_id, obtener el primer provider activo
    let finalProviderId = provider_id
    if (!finalProviderId) {
      console.log('🔍 API Bookings: No se proporcionó provider_id, buscando uno activo...')
      const { data: providers, error: providersError } = await supabase
        .from('providers')
        .select('id')
        .eq('tenant_id', tenant_id)
        .eq('is_active', true)
        .limit(1)

      if (providersError || !providers || providers.length === 0) {
        console.log('⚠️ API Bookings: No se encontraron providers activos, creando provider automático...')
        
        // Para planes básicos, crear un provider automático asociado al dueño del tenant
        const { data: tenantWithOwner, error: tenantOwnerError } = await supabase
          .from('tenants')
          .select('owner_id, subscription_plan')
          .eq('id', tenant_id)
          .single()

        if (tenantOwnerError || !tenantWithOwner || !tenantWithOwner.owner_id) {
          console.log('❌ API Bookings: Error obteniendo owner del tenant:', tenantOwnerError)
          return NextResponse.json(
            { error: 'No se pudo crear provider automático: tenant sin owner' },
            { status: 500 }
          )
        }

        console.log('🔍 API Bookings: Tenant owner info:', {
          tenant_id,
          owner_id: tenantWithOwner.owner_id,
          subscription_plan: tenantWithOwner.subscription_plan
        })

        // Primero verificar si el owner ya existe en la tabla users
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', tenantWithOwner.owner_id)
          .eq('tenant_id', tenant_id)
          .single()

        let userIdForProvider = null

        if (userCheckError && userCheckError.code !== 'PGRST116') {
          // Error diferente a "no encontrado"
          console.log('❌ API Bookings: Error verificando usuario:', userCheckError)
          return NextResponse.json(
            { error: 'Error verificando usuario del tenant' },
            { status: 500 }
          )
        }

        if (existingUser) {
          // El usuario ya existe en la tabla users
          userIdForProvider = existingUser.id
          console.log('✅ API Bookings: Usuario existente encontrado:', userIdForProvider)
        } else {
          // Crear el usuario en la tabla users primero
          const { data: newUser, error: createUserError } = await supabase
            .from('users')
            .insert({
              tenant_id: tenant_id,
              auth_user_id: tenantWithOwner.owner_id,
              name: 'Owner', // Nombre por defecto, se puede actualizar después
              email: 'owner@tenant.com', // Email por defecto
              role: 'owner'
            })
            .select('id')
            .single()

          if (createUserError || !newUser) {
            console.log('❌ API Bookings: Error creando usuario:', createUserError)
            return NextResponse.json(
              { error: 'No se pudo crear usuario para el provider' },
              { status: 500 }
            )
          }

          userIdForProvider = newUser.id
          console.log('✅ API Bookings: Usuario creado:', userIdForProvider)
        }

        // Crear provider automático
        const { data: newProvider, error: createProviderError } = await supabase
          .from('providers')
          .insert({
            tenant_id: tenant_id,
            user_id: userIdForProvider,
            bio: 'Provider automático para plan básico',
            specialties: ['General'],
            commission_rate: 0.00,
            is_active: true
          })
          .select('id')
          .single()

        if (createProviderError || !newProvider) {
          console.log('❌ API Bookings: Error creando provider automático:', {
            error: createProviderError,
            data: newProvider,
            insertData: {
              tenant_id: tenant_id,
              user_id: userIdForProvider,
              bio: 'Provider automático para plan básico',
              specialties: ['General'],
              commission_rate: 0.00,
              is_active: true
            }
          })
          return NextResponse.json(
            { 
              error: 'No se pudo crear provider automático',
              details: createProviderError?.message || 'Unknown error'
            },
            { status: 500 }
          )
        }

        finalProviderId = newProvider.id
        console.log('✅ API Bookings: Provider automático creado:', finalProviderId)
      } else {
        finalProviderId = providers[0].id
        console.log('✅ API Bookings: Provider existente encontrado:', finalProviderId)
      }
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

    console.log('🔍 API Bookings: Verificando provider:', finalProviderId)
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('id', finalProviderId)
      .eq('tenant_id', tenant_id)
      .eq('is_active', true)
      .single()

    if (providerError || !provider) {
      console.log('❌ API Bookings: Error con provider:', { providerError, provider })
      return NextResponse.json(
        { error: 'Proveedor no encontrado o inactivo' },
        { status: 404 }
      )
    }
    console.log('✅ API Bookings: Provider encontrado:', provider)

    // Crear la reserva
    const bookingData = {
      tenant_id,
      service_id,
      provider_id: finalProviderId,
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

    console.log('💾 API Bookings: Datos a insertar:', bookingData)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (bookingError) {
      console.error('❌ API Bookings: Error creando reserva:', bookingError)
      return NextResponse.json(
        { error: 'Error al crear la reserva: ' + bookingError.message },
        { status: 500 }
      )
    }

    console.log('✅ API Bookings: Reserva creada exitosamente:', booking)
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