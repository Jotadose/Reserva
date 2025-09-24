import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verificar si Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'https://your-project.supabase.co' &&
         supabaseAnonKey !== 'your-anon-key')
}

// Singleton para el cliente de Supabase del browser
let _supabaseClient: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!_supabaseClient) {
    if (typeof window !== 'undefined') {
      // En el browser, usar createBrowserClient para mejor SSR
      _supabaseClient = createBrowserClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        }
      )
    } else {
      // En el servidor, usar createClient normal
      _supabaseClient = createClient(
        supabaseUrl || 'https://demo.supabase.co', 
        supabaseAnonKey || 'demo-key', 
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )
    }
  }
  return _supabaseClient
}

// Cliente para uso en el frontend (singleton)
export const supabase = getSupabaseClient()

// Cliente para uso en el servidor (con service role key)
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Función helper para obtener el tenant desde el JWT
export async function getTenantFromAuth() {
  try {
    const client = getSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    
    if (!session?.access_token) {
      return null
    }
    
    // Decodificar JWT para obtener tenant_id
    const payload = JSON.parse(atob(session.access_token.split('.')[1]))
    return payload.tenant_id || null
  } catch (error) {
    console.warn('Error getting tenant from auth:', error)
    return null
  }
}

// Función para establecer el tenant en el contexto de la sesión
export async function setTenantContext(tenantId: string) {
  try {
    const client = getSupabaseClient()
    const { data: { session } } = await client.auth.getSession()
    
    if (session) {
      // Actualizar el JWT con el tenant_id
      await client.auth.updateUser({
        data: { tenant_id: tenantId }
      })
    }
  } catch (error) {
    console.warn('Error setting tenant context:', error)
  }
}

// Función para obtener datos con filtro de tenant automático
export function createTenantAwareClient(tenantId: string) {
  const client = getSupabaseClient()
  return {
    from: (table: string) => {
      return client
        .from(table)
        .select('*')
        .eq('tenant_id', tenantId)
    },
    
    insert: (table: string, data: any) => {
      return client
        .from(table)
        .insert({ ...data, tenant_id: tenantId })
    },
    
    update: (table: string, data: any) => {
      return client
        .from(table)
        .update(data)
        .eq('tenant_id', tenantId)
    },
    
    delete: (table: string) => {
      return client
        .from(table)
        .delete()
        .eq('tenant_id', tenantId)
    }
  }
}

// =============================================================================
// FUNCIONES ESPECÍFICAS PARA LAS TABLAS DE AGENDEX SAAS
// =============================================================================

// Funciones para la tabla 'providers' (barberos)
export const providersAPI = {
  getAll: (tenantId: string) => {
    const client = getSupabaseClient()
    return client
      .from('providers')
      .select(`
        *,
        users!inner(
          id,
          name,
          email,
          is_active
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
  },

  getById: (tenantId: string, providerId: string) => {
    const client = getSupabaseClient()
    return client
      .from('providers')
      .select(`
        *,
        users!inner(
          id,
          name,
          email,
          is_active
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('id', providerId)
      .single()
  },

  create: (tenantId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('providers')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single()
  },

  update: (tenantId: string, providerId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('providers')
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', providerId)
      .select()
      .single()
  },

  delete: (tenantId: string, providerId: string) => {
    const client = getSupabaseClient()
    return client
      .from('providers')
      .update({ is_active: false })
      .eq('tenant_id', tenantId)
      .eq('id', providerId)
  }
}

// Funciones para la tabla 'services'
export const servicesAPI = {
  getAll: (tenantId: string) => {
    const client = getSupabaseClient()
    return client
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name')
  },

  getById: (tenantId: string, serviceId: string) => {
    const client = getSupabaseClient()
    return client
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', serviceId)
      .single()
  },

  create: (tenantId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('services')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single()
  },

  update: (tenantId: string, serviceId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('services')
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', serviceId)
      .select()
      .single()
  },

  delete: (tenantId: string, serviceId: string) => {
    const client = getSupabaseClient()
    return client
      .from('services')
      .update({ is_active: false })
      .eq('tenant_id', tenantId)
      .eq('id', serviceId)
  }
}

// Funciones para la tabla 'availability_blocks'
export const availabilityAPI = {
  getByProvider: (tenantId: string, providerId: string, startDate?: string, endDate?: string) => {
    const client = getSupabaseClient()
    let query = client
      .from('availability_blocks')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('provider_id', providerId)
      .order('start_datetime')
    
    if (startDate) {
      query = query.gte('start_datetime', startDate)
    }
    if (endDate) {
      query = query.lte('end_datetime', endDate)
    }
    
    return query
  },

  create: (tenantId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('availability_blocks')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single()
  },

  update: (tenantId: string, blockId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('availability_blocks')
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', blockId)
      .select()
      .single()
  },

  delete: (tenantId: string, blockId: string) => {
    const client = getSupabaseClient()
    return client
      .from('availability_blocks')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', blockId)
  }
}

// Funciones para la tabla 'bookings'
export const bookingsAPI = {
  getAll: (tenantId: string, filters?: { status?: string, providerId?: string, date?: string }) => {
    const client = getSupabaseClient()
    let query = client
      .from('bookings')
      .select(`
        *,
        providers!inner(
          id,
          users!inner(
            name
          )
        ),
        services!inner(
          id,
          name,
          duration_minutes
        )
      `)
      .eq('tenant_id', tenantId)
      .order('scheduled_date', { ascending: false })
      .order('scheduled_time', { ascending: true })
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.providerId) {
      query = query.eq('provider_id', filters.providerId)
    }
    if (filters?.date) {
      query = query.eq('scheduled_date', filters.date)
    }
    
    return query
  },

  getById: (tenantId: string, bookingId: string) => {
    const client = getSupabaseClient()
    return client
      .from('bookings')
      .select(`
        *,
        providers!inner(
          id,
          users!inner(
            name
          )
        ),
        services!inner(
          id,
          name,
          duration_minutes
        )
      `)
      .eq('tenant_id', tenantId)
      .eq('id', bookingId)
      .single()
  },

  create: (tenantId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('bookings')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single()
  },

  update: (tenantId: string, bookingId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('bookings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', bookingId)
      .select()
      .single()
  },

  updateStatus: (tenantId: string, bookingId: string, status: string) => {
    const client = getSupabaseClient()
    return client
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', bookingId)
      .select()
      .single()
  },

  cancel: (tenantId: string, bookingId: string, reason?: string) => {
    const client = getSupabaseClient()
    return client
      .from('bookings')
      .update({ 
        status: 'cancelled',
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('tenant_id', tenantId)
      .eq('id', bookingId)
      .select()
      .single()
  }
}

// Funciones para la tabla 'notifications'
export const notificationsAPI = {
  getByBooking: (tenantId: string, bookingId: string) => {
    const client = getSupabaseClient()
    return client
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
  },

  create: (tenantId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('notifications')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single()
  },

  updateStatus: (tenantId: string, notificationId: string, status: string) => {
    const client = getSupabaseClient()
    return client
      .from('notifications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', notificationId)
  }
}

// Funciones para la tabla 'users'
export const usersAPI = {
  getAll: (tenantId: string) => {
    const client = getSupabaseClient()
    return client
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name')
  },

  getById: (tenantId: string, userId: string) => {
    const client = getSupabaseClient()
    return client
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', userId)
      .single()
  },

  create: (tenantId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('users')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single()
  },

  update: (tenantId: string, userId: string, data: any) => {
    const client = getSupabaseClient()
    return client
      .from('users')
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', userId)
      .select()
      .single()
  },

  delete: (tenantId: string, userId: string) => {
    const client = getSupabaseClient()
    return client
      .from('users')
      .update({ is_active: false })
      .eq('tenant_id', tenantId)
      .eq('id', userId)
  }
}

// Funciones para la tabla 'audit_log'
export const auditAPI = {
  log: (tenantId: string, userId: string, entityType: string, entityId: string, action: string, oldValues?: any, newValues?: any) => {
    const client = getSupabaseClient()
    return client
      .from('audit_log')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        old_values: oldValues,
        new_values: newValues
      })
  },

  getByEntity: (tenantId: string, entityType: string, entityId: string) => {
    const client = getSupabaseClient()
    return client
      .from('audit_log')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
  }
}

// Función para verificar si Supabase está configurado correctamente  
// (función actualizada en la parte superior del archivo)