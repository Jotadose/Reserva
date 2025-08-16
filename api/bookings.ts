// Express serverless function for Vercel to handle bookings
import express from "express";
import { json } from "body-parser";
import { Pool } from "pg";

const app = express();
app.use(json());

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Set this in Vercel/locally
});

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching bookings" });
  }
});

// Create a new booking
app.post("/api/bookings", async (req, res) => {
  const { name, phone, email, date, time, services } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO bookings (name, phone, email, date, time, services) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, phone, email, date, time, JSON.stringify(services)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error creating booking" });
  }
});

// Cancel a booking
app.delete("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Error deleting booking" });
  }
});

export default app;
