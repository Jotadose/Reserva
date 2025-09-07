/**
 * ===================================================================
 * MICHAEL THE BARBER - DESIGN SYSTEM TOKENS
 * ===================================================================
 * 
 * Sistema de diseño unificado para toda la aplicación
 * Mantiene consistencia visual y branding profesional
 */

// ===================================================================
// PALETA DE COLORES PRINCIPAL
// ===================================================================

export const BRAND_COLORS = {
  // Colores primarios
  primary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // PRINCIPAL AMARILLO
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Colores neutros (base negra)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#000000', // PRINCIPAL NEGRO
  },
  
  // Estados semánticos
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    900: '#14532d',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    900: '#7f1d1d',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
} as const;

// ===================================================================
// COMPONENTES DE DISEÑO PREDEFINIDOS
// ===================================================================

export const DESIGN_TOKENS = {
  // Botones
  button: {
    primary: 'bg-yellow-500 hover:bg-yellow-400 text-black font-semibold',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white font-medium',
    outline: 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black',
    ghost: 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-medium',
  },
  
  // Backgrounds
  background: {
    primary: 'bg-black',
    secondary: 'bg-gray-950',
    surface: 'bg-gray-900',
    elevated: 'bg-gray-800',
    overlay: 'bg-black/80 backdrop-blur-md',
    
    // Para admin panels (mantener consistencia)
    admin: 'bg-gray-950',
    adminCard: 'bg-gray-900',
    adminElevated: 'bg-gray-800',
  },
  
  // Textos
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-yellow-500',
    danger: 'text-red-400',
    success: 'text-green-400',
  },
  
  // Borders
  border: {
    default: 'border-gray-800',
    accent: 'border-yellow-500',
    muted: 'border-gray-700',
  },
  
  // Estados
  state: {
    hover: 'hover:bg-gray-800/50',
    focus: 'focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black',
    active: 'bg-yellow-500 text-black',
    disabled: 'opacity-50 cursor-not-allowed',
  },
  
  // Sombras
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg shadow-yellow-500/10',
    xl: 'shadow-xl shadow-yellow-500/20',
  },
  
  // Animations
  animation: {
    scale: 'hover:scale-105 transition-transform duration-200',
    fade: 'transition-opacity duration-300',
    slide: 'transition-all duration-300',
  }
} as const;

// ===================================================================
// UTILIDADES DE COMPONENTE
// ===================================================================

export const getButtonClass = (variant: keyof typeof DESIGN_TOKENS.button, size: 'sm' | 'md' | 'lg' = 'md') => {
  const baseClass = 'inline-flex items-center justify-center rounded-lg transition-all duration-200';
  const variantClass = DESIGN_TOKENS.button[variant];
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return `${baseClass} ${variantClass} ${sizeClasses[size]}`;
};

export const getCardClass = (elevated: boolean = false) => {
  return `${DESIGN_TOKENS.background.adminCard} ${DESIGN_TOKENS.border.default} border rounded-lg p-6 ${
    elevated ? DESIGN_TOKENS.shadow.lg : DESIGN_TOKENS.shadow.md
  }`;
};

export const getInputClass = () => {
  return `w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors`;
};

// ===================================================================
// ICONOS Y STATUS
// ===================================================================

export const STATUS_COLORS = {
  confirmed: 'text-green-400 bg-green-400/10',
  pending: 'text-yellow-400 bg-yellow-400/10',
  completed: 'text-blue-400 bg-blue-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  active: 'text-green-400 bg-green-400/10',
  inactive: 'text-gray-400 bg-gray-400/10',
} as const;

export const getStatusClass = (status: keyof typeof STATUS_COLORS) => {
  return `px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`;
};

// ===================================================================
// RESPONSIVE BREAKPOINTS
// ===================================================================

export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px', 
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
