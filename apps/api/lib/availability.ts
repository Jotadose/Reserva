// Availability slot construction & overlap detection utility
// This is extracted so we can unit test the core logic without hitting the DB.

export interface RawBooking {
  start_ts?: string | null;
  end_ts?: string | null;
  time?: string | null; // legacy fallback (HH:MM)
  duration?: number | null; // minutes
}

export interface Slot {
  time: string; // HH:MM
  available: boolean;
}

export interface BuildOptions {
  startHour?: number; // inclusive hour (local business hour start)
  endHour?: number; // closing hour (slot must finish <= endHour)
  intervalMinutes?: number; // base granularity for displaying slots
}

export function buildAvailabilitySlots(
  bookings: RawBooking[],
  date: string, // YYYY-MM-DD (assumed UTC date boundary for storage)
  opts: BuildOptions = {}
): Slot[] {
  const { startHour = 9, endHour = 18, intervalMinutes = 30 } = opts;

  const slots: Slot[] = [];
  const businessDayEndMinutes = endHour * 60;
  for (
    let currentMinutes = startHour * 60;
    ;
    currentMinutes += intervalMinutes
  ) {
    const slotStartMinutes = currentMinutes;
    const slotEndMinutes = slotStartMinutes + intervalMinutes;
    if (slotEndMinutes > businessDayEndMinutes) break; // do not create slots that would end after closing

    const hour = Math.floor(slotStartMinutes / 60);
    const minute = slotStartMinutes % 60;
    const time = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    const slotStartTs = new Date(`${date}T${time}:00Z`); // stored in UTC
    const slotEndTs = new Date(slotStartTs.getTime() + intervalMinutes * 60000);

    let available = true;
    for (const b of bookings) {
      let bookingStart: Date | null = null;
      let bookingEnd: Date | null = null;
      if (b.start_ts && b.end_ts) {
        bookingStart = new Date(b.start_ts);
        bookingEnd = new Date(b.end_ts);
      } else if (b.time) {
        const dur = (b.duration ?? intervalMinutes) * 60000;
        bookingStart = new Date(`${date}T${b.time}:00Z`);
        bookingEnd = new Date(bookingStart.getTime() + dur);
      }
      if (bookingStart && bookingEnd) {
        // Overlap check: [slotStart, slotEnd) vs [bookingStart, bookingEnd)
        if (slotStartTs < bookingEnd && slotEndTs > bookingStart) {
          available = false;
          break;
        }
      }
    }
    slots.push({ time, available });
  }
  return slots;
}

export function filterAvailableTimes(slots: Slot[]): string[] {
  return slots.filter((s) => s.available).map((s) => s.time);
}
