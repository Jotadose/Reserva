export type PlanId = 'basic' | 'growth' | 'pro-multi' | 'enterprise'

export interface Plan {
  id: PlanId
  name: string
  price: number | 'custom'
  period: 'month' | 'year'
  currency: 'CLP'
  description: string
  features: string[]
  highlighted?: boolean
  recommended?: boolean
  enabled: boolean // si se puede contratar hoy
  // UI hints
  color?: string
  icon?: string
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 19000,
    period: 'month',
    currency: 'CLP',
    description: 'Ideal para barberos independientes. Empieza hoy y deja de confirmar manualmente.',
    features: [
      '1 barbero',
      '100% online',
      'Agenda web + móvil',
      'Recordatorios básicos',
      'Widget de reservas público',
      'Soporte por email',
    ],
    highlighted: true,
    recommended: true,
    enabled: true,
    color: 'from-orange-500 to-red-600',
    icon: 'Scissors',
  },
  {
    id: 'growth',
    name: 'Crecimiento',
    price: 39000,
    period: 'month',
    currency: 'CLP',
    description: 'Para barberías en expansión con automatización multi-etapa.',
    features: [
      'Hasta 3 barberos',
      'Recordatorios multi-etapa',
      'Notificaciones WhatsApp',
      'Pagos integrados',
      'Reportes de recurrencia',
      'Soporte prioritario',
    ],
    enabled: false,
    color: 'from-blue-500 to-blue-600',
    icon: 'BarChart3',
  },
  {
    id: 'pro-multi',
    name: 'Pro Multi',
    price: 69000,
    period: 'month',
    currency: 'CLP',
    description: 'Multi-ubicación, campañas y API Lite.',
    features: [
      'Hasta 8 barberos',
      'Roles avanzados',
      'Campañas de reactivación',
      'Reportes avanzados',
      'API Lite',
    ],
    enabled: false,
    color: 'from-purple-500 to-purple-600',
    icon: 'Users',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'custom',
    period: 'month',
    currency: 'CLP',
    description: 'Cadenas y franquicias con marca propia y SLA.',
    features: [
      'Barberos ilimitados',
      'White label + dominio',
      'Integraciones ERP/CRM',
      'SLA 99.9%',
      'Soporte 24/7',
    ],
    enabled: false,
    color: 'from-emerald-500 to-emerald-600',
    icon: 'Shield',
  },
]

export const formatCLP = (value: number | 'custom') =>
  value === 'custom' ? 'Custom' : `$${Number(value).toLocaleString('es-CL')}`
