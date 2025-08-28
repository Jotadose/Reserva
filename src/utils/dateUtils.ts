/**
 * UTILIDADES DE FECHA - Para evitar problemas de zona horaria
 * 
 * Funciones para formatear fechas de manera consistente
 * Solucionan el problema de interpretación UTC en fechas YYYY-MM-DD
 */

/**
 * Formatea una fecha en formato YYYY-MM-DD a texto legible en español
 * Evita problemas de zona horaria agregando una hora específica
 * 
 * @param dateString - Fecha en formato "YYYY-MM-DD"
 * @param options - Opciones de formato de fecha
 * @returns Fecha formateada en español
 */
export const formatDateString = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  }
): string => {
  // Agregar hora del mediodía para evitar problemas de zona horaria
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("es-ES", options);
};

/**
 * Formatea una fecha para mostrar solo día de la semana y día
 * 
 * @param dateString - Fecha en formato "YYYY-MM-DD"
 * @returns Fecha en formato "viernes 29"
 */
export const formatShortDate = (dateString: string): string => {
  return formatDateString(dateString, {
    weekday: "long",
    day: "numeric",
  });
};

/**
 * Formatea una fecha completa con año
 * 
 * @param dateString - Fecha en formato "YYYY-MM-DD"
 * @returns Fecha en formato "viernes, 29 de agosto de 2025"
 */
export const formatFullDate = (dateString: string): string => {
  return formatDateString(dateString, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Convierte una fecha string a objeto Date evitando problemas de zona horaria
 * 
 * @param dateString - Fecha en formato "YYYY-MM-DD"
 * @returns Objeto Date con hora del mediodía
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString + "T12:00:00");
};

/**
 * Verifica si una fecha es hoy
 * 
 * @param dateString - Fecha en formato "YYYY-MM-DD"
 * @returns true si la fecha es hoy
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date().toISOString().split("T")[0];
  return dateString === today;
};

/**
 * Verifica si una fecha es válida (no es pasada y no es domingo)
 * 
 * @param dateString - Fecha en formato "YYYY-MM-DD"
 * @returns true si la fecha es válida para reservas
 */
export const isValidBookingDate = (dateString: string): boolean => {
  const date = parseDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selectedDate = new Date(date);
  selectedDate.setHours(0, 0, 0, 0);
  
  // No puede ser en el pasado
  if (selectedDate < today) return false;
  
  // No puede ser domingo (día 0)
  if (date.getDay() === 0) return false;
  
  return true;
};
