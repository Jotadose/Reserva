// Simple dev server (CommonJS) to run the bookings API locally on port 3001
// Usage: node api/dev-server.cjs
const express = require("express");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from api folder if present, but don't overwrite existing env vars
const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath, override: false });

const app = express();
app.use(express.json());

// Debug: show if POSTGRES_URL is present and its type (mask password)
const pgUrl = process.env.POSTGRES_URL;
if (!pgUrl) {
  console.error("dev-server: POSTGRES_URL is not set");
} else {
  try {
    const urlObj = new URL(pgUrl);
    const masked = `${urlObj.protocol}//${urlObj.username}:*****@${urlObj.hostname}:${urlObj.port}${urlObj.pathname}`;
    console.log(
      "dev-server: POSTGRES_URL type=",
      typeof pgUrl,
      "value=",
      masked,
    );
  } catch (e) {
    console.log(
      "dev-server: POSTGRES_URL present but failed to parse, raw type=",
      typeof pgUrl,
    );
  }
}

const pool = new Pool({ connectionString: pgUrl });

app.get("/api/bookings", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY date DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("dev-server: Error fetching bookings", err);
    res
      .status(500)
      .json({ error: "Error fetching bookings", detail: err && err.message });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { name, phone, email, date, time, service, notes } = req.body;

  try {
    // Parse service to get duration
    let duration = 45; // default
    if (service && service.includes("90")) {
      duration = 90;
    }

    // Calculate start_ts and end_ts
    const start_ts = new Date(`${date}T${time}:00`);
    const end_ts = new Date(start_ts.getTime() + duration * 60000);

    // Use 'services' (plural) to match the actual schema
    const result = await pool.query(
      "INSERT INTO bookings (name, phone, email, date, time, services, duration, start_ts, end_ts) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        name,
        phone,
        email,
        date,
        time,
        JSON.stringify([service]),
        duration,
        start_ts,
        end_ts,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("dev-server: Error creating booking", err);

    // Check for conflict (409)
    if (err.code === "23P01") {
      // exclusion constraint violation
      return res
        .status(409)
        .json({ error: "Time slot already booked or overlapping" });
    }

    res
      .status(500)
      .json({ error: "Error creating booking", detail: err && err.message });
  }
});

// Availability endpoint
app.get("/api/bookings/availability", async (req, res) => {
  try {
    const date = req.query.date;
    console.log("dev-server: availability request for date:", date);

    if (!date) return res.status(400).json({ error: "Missing date parameter" });

    // Fetch all bookings for the date with duration info
    console.log("dev-server: querying database for bookings...");
    const result = await pool.query(
      "SELECT start_ts, end_ts, time, duration, date FROM bookings WHERE date = $1",
      [date],
    );
    console.log(
      "dev-server: found",
      result.rows.length,
      "bookings for date",
      date,
    );
    console.log("dev-server: bookings data:", result.rows);

    const startHour = 9;
    const endHour = 19;
    const intervalMinutes = 45;
    const slots = [];

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
          const slotEnd = new Date(
            slotDateTime.getTime() + intervalMinutes * 60000,
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
            bookingStartTime.getTime() + bookingDuration * 60000,
          );
          const slotEnd = new Date(
            slotDateTime.getTime() + intervalMinutes * 60000,
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
  } catch (err) {
    console.error("dev-server: Error fetching availability:", err);
    res.status(500).json({
      error: "Error fetching availability",
      detail: err && err.message,
    });
  }
});

// Also provide /api/availability endpoint (same as /api/bookings/availability)
app.get("/api/availability", async (req, res) => {
  try {
    const date = req.query.date;
    console.log("dev-server: availability request for date:", date);

    if (!date) return res.status(400).json({ error: "Missing date parameter" });

    // Fetch all bookings for the date with duration info
    console.log("dev-server: querying database for bookings...");
    const result = await pool.query(
      "SELECT start_ts, end_ts, time, duration, date FROM bookings WHERE date = $1",
      [date],
    );
    console.log(
      "dev-server: found",
      result.rows.length,
      "bookings for date",
      date,
    );
    console.log("dev-server: bookings data:", result.rows);

    const startHour = 9;
    const endHour = 19;
    const intervalMinutes = 45;
    const slots = [];

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
          const slotEnd = new Date(
            slotDateTime.getTime() + intervalMinutes * 60000,
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
            bookingStartTime.getTime() + bookingDuration * 60000,
          );
          const slotEnd = new Date(
            slotDateTime.getTime() + intervalMinutes * 60000,
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
  } catch (err) {
    console.error("dev-server: Error fetching availability:", err);
    res.status(500).json({
      error: "Error fetching availability",
      detail: err && err.message,
    });
  }
});

// PATCH endpoint to update booking (reschedule)
app.patch("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { date, time, status } = req.body;

  try {
    console.log("dev-server: updating booking", id, "with data:", req.body);

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
        const durationResult = await pool.query(
          "SELECT duration FROM bookings WHERE id = $1",
          [id],
        );
        const duration = durationResult.rows[0]?.duration || 45;
        const endTs = new Date(startTs.getTime() + duration * 60000);

        updateFields.push(`start_ts = $${paramIndex++}`);
        updateValues.push(startTs.toISOString());
        updateFields.push(`end_ts = $${paramIndex++}`);
        updateValues.push(endTs.toISOString());
      } else {
        // Only time changed, get existing date
        const dateResult = await pool.query(
          "SELECT date FROM bookings WHERE id = $1",
          [id],
        );
        const existingDate = dateResult.rows[0]?.date;
        if (existingDate) {
          const dateStr = existingDate.toISOString().split("T")[0];
          const startTs = new Date(`${dateStr}T${time}:00Z`);

          const durationResult = await pool.query(
            "SELECT duration FROM bookings WHERE id = $1",
            [id],
          );
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

    console.log(
      "dev-server: executing query:",
      query,
      "with values:",
      updateValues,
    );
    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("dev-server: booking updated successfully");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("dev-server: Error updating booking", err);
    res
      .status(500)
      .json({ error: "Error updating booking", detail: err && err.message });
  }
});

// POST fallback for update (some clients/proxies block PATCH)
app.post("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { date, time, status } = req.body;

  try {
    console.log(
      "dev-server: updating booking via POST (fallback)",
      id,
      "with data:",
      req.body,
    );

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

      if (date) {
        const startTs = new Date(`${date}T${time}:00Z`);
        const durationResult = await pool.query(
          "SELECT duration FROM bookings WHERE id = $1",
          [id],
        );
        const duration = durationResult.rows[0]?.duration || 45;
        const endTs = new Date(startTs.getTime() + duration * 60000);

        updateFields.push(`start_ts = $${paramIndex++}`);
        updateValues.push(startTs.toISOString());
        updateFields.push(`end_ts = $${paramIndex++}`);
        updateValues.push(endTs.toISOString());
      } else {
        const dateResult = await pool.query(
          "SELECT date FROM bookings WHERE id = $1",
          [id],
        );
        const existingDate = dateResult.rows[0]?.date;
        if (existingDate) {
          const dateStr = existingDate.toISOString().split("T")[0];
          const startTs = new Date(`${dateStr}T${time}:00Z`);
          const durationResult = await pool.query(
            "SELECT duration FROM bookings WHERE id = $1",
            [id],
          );
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
    console.log(
      "dev-server: executing query (POST fallback):",
      query,
      "with values:",
      updateValues,
    );
    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("dev-server: booking updated successfully (POST fallback)");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("dev-server: Error updating booking (POST fallback)", err);
    res
      .status(500)
      .json({ error: "Error updating booking", detail: err && err.message });
  }
});

// PATCH endpoint to update booking status
app.patch("/api/bookings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log("dev-server: updating booking status", id, "to", status);

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log("dev-server: booking status updated successfully");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("dev-server: Error updating booking status", err);
    res
      .status(500)
      .json({
        error: "Error updating booking status",
        detail: err && err.message,
      });
  }
});

// POST fallback for status update
app.post("/api/bookings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(
    "dev-server: updating booking status via POST (fallback)",
    id,
    "to",
    status,
  );

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  try {
    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    console.log(
      "dev-server: booking status updated successfully (POST fallback)",
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(
      "dev-server: Error updating booking status (POST fallback)",
      err,
    );
    res
      .status(500)
      .json({
        error: "Error updating booking status",
        detail: err && err.message,
      });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    console.error("dev-server: Error deleting booking", err);
    res
      .status(500)
      .json({ error: "Error deleting booking", detail: err && err.message });
  }
});

const port = process.env.DEV_API_PORT || 3001;
app.listen(port, () => {
  console.log(`Dev API server listening on http://localhost:${port}`);
});
