// Express serverless function for Vercel to handle bookings
import express from "express";
import { Pool } from "pg";

// Load local .env when running locally (not needed on Vercel, which uses Environment Variables)
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
// Use built-in express JSON parser
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Set this in Vercel/locally
});

// Debugging: log connection string presence (don't expose in production)
if (process.env.NODE_ENV !== "production") {
  console.log("POSTGRES_URL present:", !!process.env.POSTGRES_URL);
}

pool.on("error", (err) => {
  console.error("Unexpected error on idle pg client", err);
});

// Test connection once at startup (helpful for vercel dev)
(async () => {
  try {
    const res = await pool.query("SELECT 1");
    if (process.env.NODE_ENV !== "production") {
      console.log("Postgres connection test OK:", res.rows);
    }
  } catch (err) {
    console.error("Postgres connection test FAILED:", err);
  }
})();

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const { date } = req.query;
    let result;
    if (date && typeof date === "string") {
      result = await pool.query("SELECT * FROM bookings WHERE date = $1 ORDER BY time", [date]);
    } else {
      result = await pool.query("SELECT * FROM bookings ORDER BY date DESC");
    }
    res.json(result.rows);
  } catch (err: any) {
    console.error("Error fetching bookings:", err);
    const payload: any = { error: "Error fetching bookings" };
    if (process.env.NODE_ENV !== "production" && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
});

// Availability endpoint: returns time slots for a given date with availability
app.get("/api/bookings/availability", async (req, res) => {
  try {
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ error: "Missing date parameter" });

    // Fetch all bookings for the date with duration info
    const result = await pool.query(
      "SELECT start_ts, end_ts, time, duration FROM bookings WHERE date = $1",
      [date],
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
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      // Create slot time for comparison - use UTC to match database timestamps
      const slotDateTime = new Date(`${date}T${time}:00Z`); // Add Z for UTC

      // Check if this slot conflicts with any existing booking
      let available = true;
      for (const booking of result.rows) {
        if (booking.start_ts && booking.end_ts) {
          // Use precise start_ts/end_ts comparison
          const bookingStart = new Date(booking.start_ts);
          const bookingEnd = new Date(booking.end_ts);
          const slotEnd = new Date(slotDateTime.getTime() + intervalMinutes * 60000);

          // Check for overlap: slot overlaps if it starts before booking ends AND ends after booking starts
          if (slotDateTime < bookingEnd && slotEnd > bookingStart) {
            available = false;
            break;
          }
        } else if (booking.time) {
          // Fallback: if no start_ts/end_ts, use time + duration
          const bookingDuration = booking.duration || 45;
          const bookingStartTime = new Date(`${date}T${booking.time}:00Z`); // Add Z for UTC
          const bookingEndTime = new Date(bookingStartTime.getTime() + bookingDuration * 60000);
          const slotEnd = new Date(slotDateTime.getTime() + intervalMinutes * 60000);

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
    const availableSlots = slots.filter((slot) => slot.available).map((slot) => slot.time);
    res.json({ availableSlots, allSlots: slots });
  } catch (err: any) {
    console.error("Error fetching availability:", err);
    const payload: any = { error: "Error fetching availability" };
    if (process.env.NODE_ENV !== "production" && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
});

// Create a new booking
app.post("/api/bookings", async (req, res) => {
  try {
    const { name, phone, email, date, time, service, services, notes } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !date || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Support both new format (service string) and old format (services array)
    let duration = 45; // default
    let finalServices;

    if (service) {
      // New format: single service string
      if (service.includes("90")) {
        duration = 90;
      }
      finalServices = [{ name: service, duration }];
    } else if (services && Array.isArray(services)) {
      // Old format: services array
      duration = services.reduce((s: number, it: any) => s + (it.duration || 0), 0) || 45;
      finalServices = services;
    } else {
      return res.status(400).json({ error: "Missing service or services" });
    }

    // Normalize inputs
    const normalizedDate =
      typeof date === "string" ? date : new Date(date).toISOString().slice(0, 10);
    const normalizedTime = typeof time === "string" ? time.padStart(5, "0") : time;

    // Compute start_ts and end_ts using UTC to match database timestamps
    const startTs = new Date(`${normalizedDate}T${normalizedTime}:00Z`).toISOString();
    const endDate = new Date(new Date(startTs).getTime() + duration * 60000).toISOString();

    // Insert using start_ts/end_ts when columns exist; otherwise fallback to simple insert
    try {
      const result = await pool.query(
        "INSERT INTO bookings (name, phone, email, date, time, services, duration, start_ts, end_ts) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [
          name,
          phone,
          email,
          normalizedDate,
          normalizedTime,
          JSON.stringify(finalServices),
          duration,
          startTs,
          endDate,
        ],
      );
      res.status(201).json(result.rows[0]);
    } catch (innerErr: any) {
      // Check for conflict (409)
      if (innerErr.code === "23P01") {
        // exclusion constraint violation
        return res.status(409).json({ error: "Time slot already booked or overlapping" });
      }

      // Exclusion constraint violation (overlap) or unique index violation
      // Exclusion constraint errors in Postgres use SQLSTATE '23P01'
      if (innerErr && (innerErr.code === "23P01" || innerErr.code === "23505")) {
        return res.status(409).json({ error: "Time slot already booked or overlapping" });
      }
      throw innerErr;
    }
  } catch (err: any) {
    console.error("Error creating booking:", err);
    const payload: any = { error: "Error creating booking" };
    if (process.env.NODE_ENV !== "production" && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
});

// Cancel a booking
app.delete("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err: any) {
    console.error("Error deleting booking:", err);
    const payload: any = { error: "Error deleting booking" };
    if (process.env.NODE_ENV !== "production" && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
});

// PATCH endpoint to update booking (reschedule)
app.patch("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { date, time, status } = req.body;

  try {
    console.log("Updating booking", id, "with data:", req.body);

    // Update booking fields
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (date) {
      updateFields.push(`date = $${paramIndex++}`);
      updateValues.push(date);
    }

    if (time) {
      updateFields.push(`time = $${paramIndex++}`);
      updateValues.push(time);

      // Also update start_ts and end_ts if we have time
      if (date) {
        // We have both date and time, calculate new timestamps
        const startTs = new Date(`${date}T${time}:00Z`);

        // Get duration from existing booking
        const durationResult = await pool.query("SELECT duration FROM bookings WHERE id = $1", [
          id,
        ]);
        const duration = durationResult.rows[0]?.duration || 45;
        const endTs = new Date(startTs.getTime() + duration * 60000);

        updateFields.push(`start_ts = $${paramIndex++}`);
        updateValues.push(startTs.toISOString());
        updateFields.push(`end_ts = $${paramIndex++}`);
        updateValues.push(endTs.toISOString());
      } else {
        // Only time changed, get existing date
        const dateResult = await pool.query("SELECT date FROM bookings WHERE id = $1", [id]);
        const existingDate = dateResult.rows[0]?.date;
        if (existingDate) {
          const dateStr = existingDate.toISOString().split("T")[0];
          const startTs = new Date(`${dateStr}T${time}:00Z`);

          const durationResult = await pool.query("SELECT duration FROM bookings WHERE id = $1", [
            id,
          ]);
          const duration = durationResult.rows[0]?.duration || 45;
          const endTs = new Date(startTs.getTime() + duration * 60000);

          updateFields.push(`start_ts = $${paramIndex++}`);
          updateValues.push(startTs.toISOString());
          updateFields.push(`end_ts = $${paramIndex++}`);
          updateValues.push(endTs.toISOString());
        }
      }
    }

    if (status) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updateValues.push(id);
    const query = `UPDATE bookings SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;

    console.log("Executing query:", query, "with values:", updateValues);
    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("Booking updated successfully");
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error("Error updating booking:", err);
    const payload: any = { error: "Error updating booking" };
    if (process.env.NODE_ENV !== "production" && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
});

// PATCH endpoint to update booking status
app.patch("/api/bookings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("Updating booking status", id, "to", status);

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const result = await pool.query("UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *", [
      status,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("Booking status updated successfully");
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error("Error updating booking status:", err);
    const payload: any = { error: "Error updating booking status" };
    if (process.env.NODE_ENV !== "production" && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
});

export default app;
