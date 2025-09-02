/**
 * ===================================================================
 * UTILIDADES COMPARTIDAS - SISTEMA DE RESERVAS
 * ===================================================================
 *
 * Funciones de utilidad compartidas entre frontend y API
 */

import type { Reserva, HorarioTrabajo } from "../types";

// ===================================================================
// UTILIDADES DE FECHA Y HORA
// ===================================================================

export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

export const formatTime = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

export const parseDateTime = (fecha: string, hora: string): Date => {
  return new Date(`${fecha}T${hora}:00`);
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const isValidTimeSlot = (hora: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(hora);
};

// ===================================================================
// UTILIDADES DE PRECIOS
// ===================================================================

export const formatPrice = (price: number): string => {
  return `$${price.toLocaleString("es-CL")}`;
};

export const parsePrice = (priceString: string): number => {
  return parseInt(priceString.replace(/[$.]/g, ""), 10) || 0;
};

// ===================================================================
// UTILIDADES DE VALIDACIÓN
// ===================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Formato chileno: +56 9 XXXX XXXX
  const phoneRegex = /^(\+56\s?)?[9]\s?\d{4}\s?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("569")) {
    return `+56 9 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// ===================================================================
// UTILIDADES DE DISPONIBILIDAD
// ===================================================================

export const generateTimeSlots = (
  horaInicio: string,
  horaFin: string,
  duracionServicio: number = 30
): string[] => {
  const slots: string[] = [];
  const inicio = parseTime(horaInicio);
  const fin = parseTime(horaFin);

  let current = inicio;
  while (current < fin) {
    slots.push(formatTimeSlot(current));
    current = addMinutes(current, duracionServicio);
  }

  return slots;
};

export const parseTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatTimeSlot = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

export const isSlotAvailable = (
  hora: string,
  fecha: string,
  reservasExistentes: Reserva[]
): boolean => {
  return !reservasExistentes.some(
    (reserva) =>
      reserva.fecha === fecha &&
      reserva.hora === hora &&
      reserva.estado !== "cancelada"
  );
};

// ===================================================================
// UTILIDADES DE ESTADO
// ===================================================================

export const getEstadoColor = (estado: Reserva["estado"]): string => {
  switch (estado) {
    case "confirmada":
      return "success";
    case "pendiente":
      return "warning";
    case "cancelada":
      return "danger";
    case "completada":
      return "primary";
    default:
      return "secondary";
  }
};

export const getEstadoLabel = (estado: Reserva["estado"]): string => {
  const labels = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    completada: "Completada",
    cancelada: "Cancelada",
  };
  return labels[estado] || estado;
};

// ===================================================================
// UTILIDADES DE FILTROS
// ===================================================================

export const filterBySearch = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm) return items;

  const lowercaseSearch = searchTerm.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(lowercaseSearch);
    })
  );
};

export const sortBy = <T>(
  items: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] => {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

// ===================================================================
// UTILIDADES DE PAGINACIÓN
// ===================================================================

export const paginate = <T>(
  items: T[],
  page: number = 1,
  limit: number = 10
): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} => {
  const offset = (page - 1) * limit;
  const data = items.slice(offset, offset + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
};

// ===================================================================
// UTILIDADES DE DÍAS DE LA SEMANA
// ===================================================================

export const getDayName = (date: Date): string => {
  const days = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  return days[date.getDay()];
};

export const isWorkingDay = (
  date: Date,
  horariosTrabajo: HorarioTrabajo[]
): boolean => {
  const dayName = getDayName(date) as HorarioTrabajo["dia"];
  const horario = horariosTrabajo.find((h) => h.dia === dayName);
  return horario?.activo ?? false;
};

// ===================================================================
// UTILIDADES DE ERROR HANDLING
// ===================================================================

export const createApiError = (
  message: string,
  statusCode: number = 400,
  details?: any
) => {
  return {
    error: "API_ERROR",
    message,
    statusCode,
    details,
  };
};

export const isApiError = (error: any): boolean => {
  return (
    error &&
    typeof error === "object" &&
    "error" in error &&
    "statusCode" in error
  );
};

// ===================================================================
// UTILIDADES DE DEBOUNCE
// ===================================================================

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ===================================================================
// UTILIDADES DE GENERACIÓN DE IDs
// ===================================================================

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateReservaCode = (): string => {
  const prefix = "RES";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// ===================================================================
// UTILIDADES ADICIONALES PARA COMPATIBILIDAD API
// ===================================================================

export const formatCurrency = (amount: number, currency = "CLP"): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};
