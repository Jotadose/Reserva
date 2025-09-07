/**
 * Slot/Availability Service (shared)
 * --------------------------------------------------------------
 * Funciones puras reutilizables entre calendario público y agenda admin
 * para:
 *  - Calcular capacidad diaria (mayor bloque libre en minutos)
 *  - Evaluar si existe hueco suficiente para una duración requerida
 *  - (Futuro) Generar/normalizar slots a partir de reservas + bloqueos
 */
import { BOOKING_RULES } from "./rules";

export interface ReservaMin {
  hora_inicio: string;
  hora_fin: string | null;
  duracion_minutos: number;
}

export interface DiaCapacidadMeta {
  maxGap: number; // mayor hueco libre (minutos)
  hasGap: boolean; // hay hueco >= duración requerida
}

/**
 * computeDayCapacity
 * Calcula el mayor bloque libre dentro de la jornada (09:00-18:00) descontando reservas.
 * Considera reglas de mismo día: cutoff y anticipación mínima.
 */
export function computeDayCapacity(
  fecha: string,
  reservas: ReservaMin[],
  totalServiceDuration: number = BOOKING_RULES.defaultServiceDuration,
  opts?: { workStart?: number; workEnd?: number }
): DiaCapacidadMeta {
  const DAY_WORK_START = opts?.workStart ?? 9 * 60; // 09:00
  const DAY_WORK_END = opts?.workEnd ?? 18 * 60; // 18:00

  const intervals = reservas
    .map((r) => {
      const [sh, sm] = r.hora_inicio.split(":").map(Number);
      let endMin: number;
      if (r.hora_fin) {
        const [eh, em] = r.hora_fin.split(":").map(Number);
        endMin = eh * 60 + em;
      } else {
        const startMin = sh * 60 + sm;
        endMin = startMin + (r.duracion_minutos || totalServiceDuration);
      }
      return { start: sh * 60 + sm, end: endMin };
    })
    .filter((i) => i.end > i.start)
    .sort((a, b) => a.start - b.start);

  // Merge overlapping
  const merged: { start: number; end: number }[] = [];
  for (const it of intervals) {
    if (!merged.length || it.start > merged[merged.length - 1].end) {
      merged.push({ ...it });
    } else if (it.end > merged[merged.length - 1].end) {
      merged[merged.length - 1].end = it.end;
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = fecha === todayStr;
  const now = new Date();
  let earliestStart = DAY_WORK_START;
  if (isToday) {
    const nowM = now.getHours() * 60 + now.getMinutes();
    earliestStart = Math.max(
      earliestStart,
      nowM + BOOKING_RULES.sameDayMinAdvanceMinutes,
      now.getHours() >= BOOKING_RULES.sameDayCutoffHour
        ? DAY_WORK_END
        : earliestStart
    );
  }

  let cursor = DAY_WORK_START;
  let maxGap = 0;
  for (const block of merged) {
    if (block.end <= earliestStart) {
      cursor = Math.max(cursor, block.end);
      continue;
    }
    const gapStart = Math.max(cursor, earliestStart);
    const gapEnd = block.start;
    if (gapEnd > gapStart) maxGap = Math.max(maxGap, gapEnd - gapStart);
    cursor = Math.max(cursor, block.end);
  }
  if (cursor < DAY_WORK_END) {
    const tailGapStart = Math.max(cursor, earliestStart);
    if (DAY_WORK_END > tailGapStart)
      maxGap = Math.max(maxGap, DAY_WORK_END - tailGapStart);
  }
  return { maxGap, hasGap: maxGap >= totalServiceDuration };
}

// Placeholder para futura generación de slots unificada
export interface SlotGenerado {
  time: string;
  available: boolean;
  edge?: boolean;
}

export interface GenerarSlotsParams {
  fecha: string;
  reservas: ReservaMin[];
  duracion: number;
  intervaloBase?: number; // 30
  workStart?: number; // min desde 00:00
  workEnd?: number;
}

/**
 * generateBaseSlots (simple) – se ampliará para replicar lógica completa de edge slots.
 */
export function generateBaseSlots({
  duracion: _duracion, // no usado todavía
  intervaloBase = 30,
  workStart = 9 * 60,
  workEnd = 18 * 60,
}: Omit<GenerarSlotsParams, "fecha" | "reservas">): string[] {
  const out: string[] = [];
  for (let m = workStart; m + intervaloBase <= workEnd; m += intervaloBase) {
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    out.push(`${hh}:${mm}`);
  }
  return out;
}

// Helper parse HH:MM to minutes
function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * rebuildEdgeSlots
 * Replica la lógica de BookingCalendar para recuperar slots justo antes de una reserva.
 */
export function rebuildEdgeSlots(
  current: string[],
  reservas: ReservaMin[],
  totalServiceDuration: number,
  baseSlotMinutes = 30,
  workStart = 9 * 60,
  workEnd = 18 * 60
): string[] {
  const bookings = reservas.map((r) => {
    const startMin = toMin(r.hora_inicio);
    let endMin: number;
    if (r.hora_fin) endMin = toMin(r.hora_fin);
    else endMin = startMin + (r.duracion_minutos || totalServiceDuration);
    return { startMin, endMin };
  });
  const overlaps = (
    b: { startMin: number; endMin: number },
    slotStart: number,
    slotEnd: number
  ) => !(slotEnd <= b.startMin || slotStart >= b.endMin);
  const result = [...current];
  for (
    let m = workStart;
    m + baseSlotMinutes <= workEnd;
    m += baseSlotMinutes
  ) {
    const baseEnd = m + baseSlotMinutes;
    const matching = bookings.find((b) => baseEnd === b.startMin);
    if (!matching) continue;
    const fullEnd = m + totalServiceDuration;
    if (fullEnd > matching.startMin) continue; // no cabe
    const conflict = bookings.some((b) => overlaps(b, m, fullEnd));
    if (conflict) continue;
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    const slot = `${hh}:${mm}`;
    if (!result.includes(slot)) result.push(slot);
  }
  return result.sort((a, b) => a.localeCompare(b));
}

export interface DateAvailabilityContext {
  blockedDates?: Record<string, boolean>;
  workingDays?: Set<number>; // días permitidos para barbero
  capacityMap?: Record<string, DiaCapacidadMeta>; // opcional
}

/** Determina si una fecha está disponible según reglas globales y contexto. */
export function isDateAvailable(
  dateISO: string,
  ctx: DateAvailabilityContext,
  _requiredDuration: number = BOOKING_RULES.defaultServiceDuration
): boolean {
  if (!dateISO) return false;
  const parsed = new Date(dateISO + "T12:00:00");
  if (isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateOnly = new Date(parsed);
  dateOnly.setHours(0, 0, 0, 0);
  if (dateOnly < today) return false;
  if (ctx?.workingDays && !ctx.workingDays.has(parsed.getDay())) return false;
  if (ctx?.blockedDates && ctx.blockedDates[dateISO]) return false;
  // Cutoff mismo día
  if (dateOnly.getTime() === today.getTime()) {
    if (new Date().getHours() >= BOOKING_RULES.sameDayCutoffHour) return false;
  }
  // Capacidad
  const cap = ctx.capacityMap?.[dateISO];
  if (cap && !cap.hasGap) return false;
  return true;
}
