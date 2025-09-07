// Reglas de reserva centralizadas
export const BOOKING_RULES = {
  WORKING_DAYS: new Set<number>([1, 2, 3, 4, 5, 6]), // Lunes - Sábado (0=Domingo)
  sameDayCutoffHour: 16, // después de esta hora no se aceptan nuevas para hoy
  sameDayMinAdvanceMinutes: 120, // anticipación mínima mismo día
  defaultServiceDuration: 30,
};

export const LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  en_progreso: "En progreso",
  completada: "Completada",
  cancelada: "Cancelada",
  no_show: "No se presentó",
};

// Normaliza strings de días y aplica fallback a BOOKING_RULES.WORKING_DAYS
const DAY_MAP: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6,
};

export function resolveWorkingDays(dias?: string[] | null): Set<number> {
  if (!dias || dias.length === 0) return new Set(BOOKING_RULES.WORKING_DAYS);
  const set = new Set<number>();
  dias.forEach((d) => {
    const key = d.toLowerCase();
    if (DAY_MAP[key] !== undefined) set.add(DAY_MAP[key]);
  });
  return set.size ? set : new Set(BOOKING_RULES.WORKING_DAYS);
}
