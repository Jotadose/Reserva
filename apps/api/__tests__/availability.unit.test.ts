import {
  buildAvailabilitySlots,
  filterAvailableTimes,
} from "../lib/availability";

describe("buildAvailabilitySlots", () => {
  const date = "2025-01-15";

  it("genera slots dentro del horario y excluye uno ocupado", () => {
    const bookings = [
      {
        start_ts: `${date}T10:00:00Z`,
        end_ts: `${date}T10:30:00Z`,
        duration: 30,
      },
    ];
    const slots = buildAvailabilitySlots(bookings, date, {
      startHour: 9,
      endHour: 18,
      intervalMinutes: 30,
    });
    const times = slots.map((s) => s.time);
    expect(times[0]).toBe("09:00");
    expect(times.includes("18:00")).toBe(false); // no inicia a la hora de cierre
    const taken = slots.find((s) => s.time === "10:00");
    expect(taken?.available).toBe(false);
    const available = filterAvailableTimes(slots);
    expect(available).not.toContain("10:00");
  });

  it("detecta solapes exactos y parciales", () => {
    const bookings = [
      {
        start_ts: `${date}T11:00:00Z`,
        end_ts: `${date}T11:30:00Z`,
        duration: 30,
      },
      {
        start_ts: `${date}T12:15:00Z`,
        end_ts: `${date}T12:45:00Z`,
        duration: 30,
      },
    ];
    const slots = buildAvailabilitySlots(bookings, date, {
      startHour: 11,
      endHour: 13,
      intervalMinutes: 15,
    });
    const slot1115 = slots.find((s) => s.time === "11:15");
    expect(slot1115?.available).toBe(false); // solapa parcial con 11:00-11:30
    const slot1215 = slots.find((s) => s.time === "12:15");
    expect(slot1215?.available).toBe(false); // exact start
  });
});
