import express from "express";
import { Pool } from "pg";

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

// Availability endpoint: returns time slots for a given date with availability
app.get("/api/availability", async (req, res) => {
  try {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ error: "Missing date parameter" });

    // Fetch all bookings for the date with duration info
    const result = await pool.query(
      "SELECT start_ts, end_ts, time, duration FROM bookings WHERE date = $1",
      [date]
    );

    const startHour = 9;
    const endHour = 19;
    const intervalMinutes = 45;
    const slots: Array<{ time: string; available: boolean }> = [];

    let currentMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      // Create slot time for comparison - use UTC to match database timestamps
      const slotDateTime = new Date(`${date}T${time}:00Z`); // Add Z for UTC

      // Check if this slot conflicts with any existing booking
      let available = true;
      for (const booking of result.rows) {
        if (booking.start_ts && booking.end_ts) {
          // Use precise start_ts/end_ts comparison
          const bookingStart = new Date(booking.start_ts);
          const bookingEnd = new Date(booking.end_ts);
          const slotEnd = new Date(
            slotDateTime.getTime() + intervalMinutes * 60000
          );

          // Check for overlap: slot overlaps if it starts before booking ends AND ends after booking starts
          if (slotDateTime < bookingEnd && slotEnd > bookingStart) {
            available = false;
            break;
          }
        } else if (booking.time) {
          // Fallback: if no start_ts/end_ts, use time + duration
          const bookingDuration = booking.duration || 45;
          const bookingStartTime = new Date(`${date}T${booking.time}:00Z`); // Add Z for UTC
          const bookingEndTime = new Date(
            bookingStartTime.getTime() + bookingDuration * 60000
          );
          const slotEnd = new Date(
            slotDateTime.getTime() + intervalMinutes * 60000
          );

          if (slotDateTime < bookingEndTime && slotEnd > bookingStartTime) {
            available = false;
            break;
          }
        }
      }

      slots.push({ time, available });
      currentMinutes += intervalMinutes;
    }

    // Return only available slots for the frontend
    const availableSlots = slots
      .filter((slot) => slot.available)
      .map((slot) => slot.time);
    res.json({ availableSlots, allSlots: slots });
  } catch (err: any) {
    console.error("Error fetching availability:", err);
    const payload: any = { error: "Error fetching availability" };
    if (process.env.NODE_ENV !== "production" && err && err.message)
      payload.detail = err.message;
    res.status(500).json(payload);
  }
});

export default app;
