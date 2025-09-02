import express from "express";
import { Pool } from "pg";
import {
  buildAvailabilitySlots,
  filterAvailableTimes,
} from "./lib/availability";

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

    const slots = buildAvailabilitySlots(result.rows, date, {
      startHour: 9,
      endHour: 18, // business closes at 18:00; slots must finish by this hour
      intervalMinutes: 30, // base granularity (can be adjusted later)
    });
    const availableSlots = filterAvailableTimes(slots);
    res.json({ availableSlots, allSlots: slots, meta: { date } });
  } catch (err: any) {
    console.error("Error fetching availability:", err);
    const payload: any = { error: "Error fetching availability" };
    if (process.env.NODE_ENV !== "production" && err && err.message)
      payload.detail = err.message;
    res.status(500).json(payload);
  }
});

export default app;
