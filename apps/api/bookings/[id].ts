// Vercel API route for updating and deleting specific bookings
import { Pool } from "pg";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method === "GET") {
      // Get specific booking
      const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }
      return res.json(result.rows[0]);
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      // Update booking
      const { date, time, duration, status } = req.body;

      // Validate status if provided
      const VALID_STATUSES = [
        "confirmed",
        "pending",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
        "rescheduled",
      ];

      if (status && !VALID_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ error: "Invalid status value", valid: VALID_STATUSES });
      }

      const result = await pool.query(
        `UPDATE bookings 
         SET date = COALESCE($2, date), 
             time = COALESCE($3, time), 
             duration = COALESCE($4, duration),
             status = COALESCE($5, status),
             updated_at = NOW()
         WHERE id = $1 
         RETURNING *`,
        [id, date, time, duration, status],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      return res.json({ message: "Booking updated", booking: result.rows[0] });
    }

    if (req.method === "DELETE") {
      // Delete booking
      const result = await pool.query(
        "DELETE FROM bookings WHERE id = $1 RETURNING *",
        [id],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      return res.json({
        message: "Booking deleted successfully",
        booking: result.rows[0],
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
