// Vercel API route for getting all bookings and creating new ones
import { Pool } from "pg";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      // Get all bookings
      const { date } = req.query;
      let result;

      if (date && typeof date === "string") {
        result = await pool.query("SELECT * FROM bookings WHERE date = $1 ORDER BY time", [date]);
      } else {
        result = await pool.query("SELECT * FROM bookings ORDER BY date DESC");
      }

      return res.json(result.rows);
    }

    if (req.method === "POST") {
      // Create new booking
      const { name, phone, email, date, time, service, services } = req.body;

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

      // Insert booking
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

      return res.status(201).json(result.rows[0]);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Database error:", error);

    // Check for conflict (409)
    if (error.code === "23P01" || error.code === "23505") {
      return res.status(409).json({ error: "Time slot already booked or overlapping" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}
