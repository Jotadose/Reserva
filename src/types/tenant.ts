// =============================================================================
// TIPOS BASADOS EN LA ESTRUCTURA REAL DE BASE DE DATOS AGENDEX SAAS
// =============================================================================

export interface Tenant {
  id: string
  slug: string // para subdominios: barberia.agendex.studio
  name: string
  plan: 'basic' | 'premium' | 'enterprise'
  status: 'trial' | 'active' | 'suspended' | 'cancelled'
  contact_email?: string
  contact_phone?: string
  slot_duration_minutes: number
  settings: Record<string, any> // jsonb field
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  tenant_id: string
  auth_user_id?: string // Supabase auth user ID
  name: string
  email: string
  role: 'owner' | 'admin' | 'barber' | 'client'
  is_active: boolean
  settings: Record<string, any> // jsonb field
  created_at: string
  updated_at: string
}

// Barberos registrados (tabla providers)
export interface Provider {
  id: string
  tenant_id: string
  user_id: string
  bio?: string
  specialties: string[] // array de especialidades
  commission_rate: number // porcentaje de comisión
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  tenant_id: string
  name: string
  description?: string
  duration_minutes: number
  price: number // precio en centavos
  is_active: boolean
  created_at: string
  updated_at: string
}

// Disponibilidad y bloqueos de barberos (tabla availability_blocks)
export interface AvailabilityBlock {
  id: string
  tenant_id: string
  provider_id: string
  start_datetime: string
  end_datetime: string
  type: 'available' | 'break' | 'vacation' | 'blocked'
  reason?: string
  created_at: string
  updated_at: string
}

// Reservas de clientes (tabla bookings)
export interface Booking {
  id: string
  tenant_id: string
  client_id?: string // puede ser null para clientes anónimos
  provider_id: string
  service_id: string
  scheduled_date: string // fecha de la reserva
  scheduled_time: string // hora de la reserva
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  service_price: number // precio del servicio en centavos
  total_price: number // precio total en centavos
  
  // Datos del cliente (para clientes anónimos)
  client_name?: string
  client_email?: string
  client_phone?: string
  
  // Notificaciones
  confirmation_sent: boolean
  reminder_sent_24h: boolean
  reminder_sent_2h: boolean
  
  created_at: string
  updated_at: string
}

// Notificaciones (tabla notifications)
export interface Notification {
  id: string
  tenant_id: string
  booking_id?: string
  user_id?: string
  channel: 'email' | 'whatsapp'
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  created_at: string
  updated_at: string
}

// Log de auditoría (tabla audit_log)
export interface AuditLog {
  id: string
  tenant_id?: string
  user_id?: string
  entity_type: string // 'booking', 'user', 'service', etc.
  entity_id?: string
  action: string // 'create', 'update', 'delete', etc.
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  created_at: string
}