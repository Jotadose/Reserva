import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Cliente para uso en el frontend (con valores por defecto para desarrollo)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Cliente para uso en el servidor (con service role key)
export const supabaseAdmin = createClient(
  supabaseUrl,
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
    const { data: { session } } = await supabase.auth.getSession()
    
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
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Actualizar el JWT con el tenant_id
      await supabase.auth.updateUser({
        data: { tenant_id: tenantId }
      })
    }
  } catch (error) {
    console.warn('Error setting tenant context:', error)
  }
}

// Función para obtener datos con filtro de tenant automático
export function createTenantAwareClient(tenantId: string) {
  return {
    from: (table: string) => {
      return supabase
        .from(table)
        .select('*')
        .eq('tenant_id', tenantId)
    },
    
    insert: (table: string, data: any) => {
      return supabase
        .from(table)
        .insert({ ...data, tenant_id: tenantId })
    },
    
    update: (table: string, data: any) => {
      return supabase
        .from(table)
        .update(data)
        .eq('tenant_id', tenantId)
    },
    
    delete: (table: string) => {
      return supabase
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
  getAll: (tenantId: string) => 
    supabase
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
      .eq('is_active', true),

  getById: (tenantId: string, providerId: string) =>
    supabase
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
      .single(),

  create: (tenantId: string, data: any) =>
    supabase
      .from('providers')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single(),

  update: (tenantId: string, providerId: string, data: any) =>
    supabase
      .from('providers')
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', providerId)
      .select()
      .single(),

  delete: (tenantId: string, providerId: string) =>
    supabase
      .from('providers')
      .update({ is_active: false })
      .eq('tenant_id', tenantId)
      .eq('id', providerId)
}

// Funciones para la tabla 'services'
export const servicesAPI = {
  getAll: (tenantId: string) =>
    supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name'),

  getById: (tenantId: string, serviceId: string) =>
    supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', serviceId)
      .single(),

  create: (tenantId: string, data: any) =>
    supabase
      .from('services')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single(),

  update: (tenantId: string, serviceId: string, data: any) =>
    supabase
      .from('services')
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', serviceId)
      .select()
      .single(),

  delete: (tenantId: string, serviceId: string) =>
    supabase
      .from('services')
      .update({ is_active: false })
      .eq('tenant_id', tenantId)
      .eq('id', serviceId)
}

// Funciones para la tabla 'availability_blocks'
export const availabilityAPI = {
  getByProvider: (tenantId: string, providerId: string, startDate?: string, endDate?: string) => {
    let query = supabase
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

  create: (tenantId: string, data: any) =>
    supabase
      .from('availability_blocks')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single(),

  update: (tenantId: string, blockId: string, data: any) =>
    supabase
      .from('availability_blocks')
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', blockId)
      .select()
      .single(),

  delete: (tenantId: string, blockId: string) =>
    supabase
      .from('availability_blocks')
      .delete()
      .eq('tenant_id', tenantId)
      .eq('id', blockId)
}

// Funciones para la tabla 'bookings'
export const bookingsAPI = {
  getAll: (tenantId: string, filters?: { status?: string, providerId?: string, date?: string }) => {
    let query = supabase
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

  getById: (tenantId: string, bookingId: string) =>
    supabase
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
      .single(),

  create: (tenantId: string, data: any) =>
    supabase
      .from('bookings')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single(),

  updateStatus: (tenantId: string, bookingId: string, status: string) =>
    supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', bookingId)
      .select()
      .single(),

  cancel: (tenantId: string, bookingId: string, reason?: string) =>
    supabase
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

// Funciones para la tabla 'notifications'
export const notificationsAPI = {
  getByBooking: (tenantId: string, bookingId: string) =>
    supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false }),

  create: (tenantId: string, data: any) =>
    supabase
      .from('notifications')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single(),

  updateStatus: (tenantId: string, notificationId: string, status: string) =>
    supabase
      .from('notifications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', notificationId)
}

// Funciones para la tabla 'users'
export const usersAPI = {
  getAll: (tenantId: string) =>
    supabase
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name'),

  getById: (tenantId: string, userId: string) =>
    supabase
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', userId)
      .single(),

  create: (tenantId: string, data: any) =>
    supabase
      .from('users')
      .insert({ ...data, tenant_id: tenantId })
      .select()
      .single(),

  update: (tenantId: string, userId: string, data: any) =>
    supabase
      .from('users')
      .update(data)
      .eq('tenant_id', tenantId)
      .eq('id', userId)
      .select()
      .single(),

  delete: (tenantId: string, userId: string) =>
    supabase
      .from('users')
      .update({ is_active: false })
      .eq('tenant_id', tenantId)
      .eq('id', userId)
}

// Funciones para la tabla 'audit_log'
export const auditAPI = {
  log: (tenantId: string, userId: string, entityType: string, entityId: string, action: string, oldValues?: any, newValues?: any) =>
    supabase
      .from('audit_log')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        old_values: oldValues,
        new_values: newValues
      }),

  getByEntity: (tenantId: string, entityType: string, entityId: string) =>
    supabase
      .from('audit_log')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
}

// Función para verificar si Supabase está configurado correctamente
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
           process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co')
}