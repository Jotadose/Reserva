/**
 * ===================================================================
 * TIPOS COMPARTIDOS - SISTEMA DE RESERVAS BARBERÍA
 * ===================================================================
 *
 * Definiciones de tipos TypeScript compartidas entre frontend y API
 * para garantizar consistencia en toda la aplicación
 */

// ===================================================================
// TIPOS PRINCIPALES
// ===================================================================

export interface Usuario {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  rol: "cliente" | "barbero" | "admin";
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Cliente extends Usuario {
  rol: "cliente";
  total_reservas?: number;
  ultima_visita?: string;
  gasto_total?: number;
}

export interface Barbero extends Usuario {
  rol: "barbero";
  especialidades?: string[];
  horario_inicio?: string;
  horario_fin?: string;
  dias_trabajo?: string[];
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion: number; // en minutos
  activo: boolean;
  categoria?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Reserva {
  id: number;
  usuario_id: number;
  barbero_id: number;
  servicio_id: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  estado: "pendiente" | "confirmada" | "completada" | "cancelada";
  precio: number;
  notas?: string;
  created_at?: string;
  updated_at?: string;

  // Relaciones populadas
  usuario?: Usuario;
  barbero?: Barbero;
  servicio?: Servicio;

  // Campos computados para compatibilidad
  cliente_nombre?: string;
  barbero_nombre?: string;
  servicio_nombre?: string;
}

// ===================================================================
// TIPOS DE API RESPONSE
// ===================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// ===================================================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ===================================================================

export interface ReservaFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: Reserva["estado"][];
  barbero_id?: number;
  servicio_id?: number;
  usuario_id?: number;
  search?: string;
}

export interface ServicioFilters {
  activo?: boolean;
  categoria?: string;
  precio_min?: number;
  precio_max?: number;
  search?: string;
}

export interface UsuarioFilters {
  rol?: Usuario["rol"];
  activo?: boolean;
  search?: string;
}

// ===================================================================
// TIPOS DE FORMULARIOS
// ===================================================================

export interface CreateReservaRequest {
  usuario_id: number;
  barbero_id: number;
  servicio_id: number;
  fecha: string;
  hora: string;
  notas?: string;
}

export interface UpdateReservaRequest {
  fecha?: string;
  hora?: string;
  estado?: Reserva["estado"];
  notas?: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  telefono: string;
  email: string;
  rol: Usuario["rol"];
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export interface CreateServicioRequest {
  nombre: string;
  descripcion?: string;
  precio: number;
  duracion: number;
  categoria?: string;
}

export interface UpdateServicioRequest {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  duracion?: number;
  activo?: boolean;
  categoria?: string;
}

// ===================================================================
// TIPOS DE HORARIOS Y DISPONIBILIDAD
// ===================================================================

export interface TimeSlot {
  hora: string;
  disponible: boolean;
  barbero_id?: number;
  reserva_id?: number;
}

export interface DisponibilidadDia {
  fecha: string;
  slots: TimeSlot[];
}

export interface HorarioTrabajo {
  dia:
    | "lunes"
    | "martes"
    | "miercoles"
    | "jueves"
    | "viernes"
    | "sabado"
    | "domingo";
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

// ===================================================================
// TIPOS DE ESTADÍSTICAS Y ANALYTICS
// ===================================================================

export interface EstadisticasReservas {
  total_reservas: number;
  reservas_completadas: number;
  reservas_canceladas: number;
  reservas_pendientes: number;
  ingresos_total: number;
  ingresos_mes_actual: number;
  reservas_hoy: number;
  reservas_mes: number;
}

export interface EstadisticasServicios {
  servicio_id: number;
  nombre: string;
  total_reservas: number;
  ingresos_generados: number;
  promedio_mensual: number;
}

export interface EstadisticasBarbero {
  barbero_id: number;
  nombre: string;
  total_citas: number;
  ingresos_generados: number;
  calificacion_promedio?: number;
  tiempo_promedio_servicio: number;
}

// ===================================================================
// TIPOS DE NOTIFICACIONES
// ===================================================================

export interface Notificacion {
  id: string;
  tipo: "info" | "success" | "warning" | "error";
  titulo: string;
  mensaje: string;
  usuario_id?: number;
  reserva_id?: number;
  leida: boolean;
  created_at: string;
}

// ===================================================================
// TIPOS DE CONFIGURACIÓN
// ===================================================================

export interface ConfiguracionBarberia {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horarios: HorarioTrabajo[];
  tiempo_anticipacion_reserva: number; // horas
  tiempo_cancelacion_limite: number; // horas
  precio_cancelacion?: number;
}

// ===================================================================
// UTILIDADES DE TIPO
// ===================================================================

export type CreateRequest<T> = Omit<T, "id" | "created_at" | "updated_at">;
export type UpdateRequest<T> = Partial<
  Omit<T, "id" | "created_at" | "updated_at">
>;

// Tipos para payload de eventos
export type ReservaEventPayload = {
  reserva: Reserva;
  usuario: Usuario;
  barbero: Barbero;
  servicio: Servicio;
};

// Estados de loading para UI
export interface LoadingState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Tipos para hooks de datos
export interface UseDataReturn<T> extends LoadingState {
  data: T | null;
  refetch: () => Promise<void>;
  reset: () => void;
}
