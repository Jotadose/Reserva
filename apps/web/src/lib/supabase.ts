import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para la autenticación
export interface YerkoProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'barber'
  created_at: string
  updated_at: string
}

// Configuración específica para Yerko
export const YERKO_CONFIG = {
  adminEmail: 'yerko@barberia.com',
  businessName: 'Barbería Yerko',
  instagram: '@yerkobarber',
  workingHours: {
    start: '11:00',
    end: '20:00',
    lunchStart: '14:00',
    lunchEnd: '15:00'
  },
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  timeSlots: ['11:00', '11:45', '12:30', '13:15', '15:00', '15:45', '16:30', '17:15', '18:00', '18:45', '19:30']
}