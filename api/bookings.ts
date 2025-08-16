// Express serverless function for Vercel to handle bookings
import express from "express";
import { Pool } from "pg";

// Load local .env when running locally (not needed on Vercel, which uses Environment Variables)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
} catch (e) {
  // ignore if dotenv not available in environment
}

const app = express();
// Use built-in express JSON parser
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Set this in Vercel/locally
});

// Debugging: log connection string presence (don't expose in production)
if (process.env.NODE_ENV !== 'production') {
  console.log('POSTGRES_URL present:', !!process.env.POSTGRES_URL);
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

// Test connection once at startup (helpful for vercel dev)
(async () => {
  try {
    const res = await pool.query('SELECT 1');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Postgres connection test OK:', res.rows);
    }
  } catch (err) {
    console.error('Postgres connection test FAILED:', err);
  }
})();

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM bookings ORDER BY date DESC");
    res.json(result.rows);
  } catch (err:any) {
    console.error('Error fetching bookings:', err);
    const payload: any = { error: "Error fetching bookings" };
    if (process.env.NODE_ENV !== 'production' && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
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
  } catch (err:any) {
    console.error('Error creating booking:', err);
    const payload: any = { error: "Error creating booking" };
    if (process.env.NODE_ENV !== 'production' && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
});

// Cancel a booking
app.delete("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
    res.status(204).end();
  } catch (err:any) {
    console.error('Error deleting booking:', err);
    const payload: any = { error: "Error deleting booking" };
    if (process.env.NODE_ENV !== 'production' && err && err.message) payload.detail = err.message;
    res.status(500).json(payload);
  }
});

export default app;
