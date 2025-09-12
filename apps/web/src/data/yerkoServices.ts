export interface YerkoService {
  id: string
  name: string
  price: number
  duration: number // en minutos
  description: string
  category: 'basico' | 'premium' | 'color' | 'especial'
  priority: 'alta' | 'media' | 'baja'
  canApplyDiscount?: boolean
  marginTime: number // tiempo de margen incluido
}

export const YERKO_SERVICES: YerkoService[] = [
  // Servicios Básicos
  {
    id: 'corte-pelo',
    name: 'Corte de Pelo',
    price: 12000,
    duration: 40,
    description: 'Corte de pelo profesional con técnicas modernas',
    category: 'basico',
    priority: 'alta',
    canApplyDiscount: true,
    marginTime: 5
  },
  {
    id: 'barba-vapor',
    name: 'Barba con toalla vapor',
    price: 10000,
    duration: 25,
    description: 'Arreglo de barba con toalla caliente y vapor',
    category: 'basico',
    priority: 'media',
    marginTime: 5
  },
  {
    id: 'corte-barba-promo',
    name: 'Corte + Barba (Promoción)',
    price: 18000,
    duration: 60,
    description: 'Combo promocional: corte de pelo + arreglo de barba',
    category: 'basico',
    priority: 'alta',
    marginTime: 5
  },
  {
    id: 'linea-diseno-corte',
    name: 'Línea de Diseño + Corte',
    price: 14000,
    duration: 45,
    description: 'Corte con líneas de diseño personalizadas',
    category: 'basico',
    priority: 'media',
    marginTime: 5
  },
  {
    id: 'cejas-corte',
    name: 'Cejas + Corte',
    price: 13000,
    duration: 45,
    description: 'Corte de pelo + arreglo de cejas',
    category: 'basico',
    priority: 'alta',
    marginTime: 5
  },

  // Servicios Premium
  {
    id: 'rulos-permanentes',
    name: 'Rulos Permanentes',
    price: 55000,
    duration: 120,
    description: 'Rulos permanentes incluye corte de pelo',
    category: 'premium',
    priority: 'media',
    marginTime: 10
  },

  // Servicios de Color
  {
    id: 'color-fantasia',
    name: 'Color Fantasía',
    price: 40000,
    duration: 180,
    description: 'Coloración fantasía en tonos vibrantes',
    category: 'color',
    priority: 'media',
    marginTime: 10
  },
  {
    id: 'color-permanente-blanco',
    name: 'Color Permanente Blanco/Grises',
    price: 60000,
    duration: 240, // 4 horas promedio (3-6 horas)
    description: 'Coloración permanente para canas y grises - proceso detallado',
    category: 'color',
    priority: 'baja',
    marginTime: 15
  },
  {
    id: 'visos-fantasia',
    name: 'Visos Fantasía',
    price: 40000,
    duration: 180,
    description: 'Visos en colores fantasía',
    category: 'color',
    priority: 'media',
    marginTime: 10
  },
  {
    id: 'visos-blanco-grises',
    name: 'Visos Blanco/Grises',
    price: 60000,
    duration: 360, // 6 horas
    description: 'Visos en tonos blancos y grises - proceso extenso',
    category: 'color',
    priority: 'baja',
    marginTime: 15
  }
]

// Configuración de horarios y slots
export const YERKO_SCHEDULE = {
  workingHours: {
    start: '11:00',
    end: '20:00',
    lunchStart: '14:00',
    lunchEnd: '15:00'
  },
  timeSlots: [
    '11:00', '11:45', '12:30', '13:15', // Mañana
    '15:00', '15:45', '16:30', '17:15', // Tarde
    '18:00', '18:45', '19:30' // Noche
  ],
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  alternativeSundays: true // Domingos alternos
}

// Períodos de cierre
export const YERKO_CLOSURES = [
  {
    id: 'vacaciones-sept',
    name: 'Vacaciones',
    startDate: '2024-09-21',
    endDate: '2024-09-28',
    type: 'vacation' as const,
    reason: 'Vacaciones anuales'
  },
  {
    id: 'competencia-oct',
    name: 'Competencia',
    startDate: '2024-10-10',
    endDate: '2024-10-14',
    type: 'event' as const,
    reason: 'Participación en competencia de barbería'
  }
]

// Configuración de políticas
export const YERKO_POLICIES = {
  advanceBookingDays: 90, // 90 días de anticipación
  minimumNoticeHours: 2, // 2 horas mínimas de anticipación
  cancellationPolicy: '24 horas de anticipación para cancelaciones',
  reschedulePolicy: 'Reagendamiento gratuito hasta 4 horas antes',
  noShowPolicy: 'No show: se cobra 50% del servicio'
}

// Información de contacto
export const YERKO_CONTACT = {
  instagram: '@yerkobarber',
  email: 'yerko@barberia.com',
  whatsapp: '+56 9 XXXX XXXX',
  address: 'Dirección de la barbería',
  businessName: 'Barbería Yerko'
}