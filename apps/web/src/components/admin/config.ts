// Configuración para el módulo de administración

// Tipos de paneles de administración disponibles
export type AdminPanelType = 'modern' | 'professional' | 'simple' | 'enhanced' | 'advanced';

// Tipos de vistas en el panel de administración
export type AdminViewMode = 'dashboard' | 'bookings' | 'services' | 'clients' | 'analytics' | 'settings';

// Configuración de navegación para el panel de administración
export const adminNavigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Vista general del sistema',
    icon: 'Layout'
  },
  {
    id: 'bookings',
    label: 'Reservas',
    description: 'Gestión de reservas',
    icon: 'Calendar'
  },
  {
    id: 'services',
    label: 'Servicios',
    description: 'Gestión de servicios',
    icon: 'Scissors'
  },
  {
    id: 'clients',
    label: 'Clientes',
    description: 'Gestión de clientes',
    icon: 'Users'
  },
  {
    id: 'analytics',
    label: 'Analíticas',
    description: 'Estadísticas y reportes',
    icon: 'BarChart3'
  },
  {
    id: 'settings',
    label: 'Configuración',
    description: 'Ajustes del sistema',
    icon: 'Settings'
  }
];

// Estados de reserva
export const bookingStatuses = [
  { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { value: 'confirmada', label: 'Confirmada', color: 'blue' },
  { value: 'completada', label: 'Completada', color: 'green' },
  { value: 'cancelada', label: 'Cancelada', color: 'red' }
];

// Configuración de permisos para roles de usuario
export const rolePermissions = {
  admin: {
    canViewDashboard: true,
    canManageBookings: true,
    canManageServices: true,
    canManageClients: true,
    canViewAnalytics: true,
    canManageSettings: true
  },
  staff: {
    canViewDashboard: true,
    canManageBookings: true,
    canManageServices: false,
    canManageClients: true,
    canViewAnalytics: false,
    canManageSettings: false
  },
  client: {
    canViewDashboard: false,
    canManageBookings: false,
    canManageServices: false,
    canManageClients: false,
    canViewAnalytics: false,
    canManageSettings: false
  }
};