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

// Función para verificar si Supabase está configurado correctamente
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
           process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://demo.supabase.co')
}