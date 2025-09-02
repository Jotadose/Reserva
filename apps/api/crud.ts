// Vercel API route for all booking CRUD operations
import { Pool } from "pg";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action, id } = req.query;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  try {
    console.log("CRUD request:", { action, id, body: req.body }); // Debug

    // Handle DELETE operation
    if (action === "delete") {
      if (!id) {
        return res.status(400).json({ error: "ID is required for delete operation" });
      }

      const result = await pool.query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      console.log("Delete successful:", result.rows[0].id); // Debug
      return res.json({ message: "Booking deleted successfully", booking: result.rows[0] });
    }

    // Handle UPDATE operation
    if (action === "update") {
      if (!id) {
        return res.status(400).json({ error: "ID is required for update operation" });
      }

      const { date, time, duration, status } = req.body;

      const result = await pool.query(
        `UPDATE bookings 
         SET date = COALESCE($2, date), 
             time = COALESCE($3, time), 
             duration = COALESCE($4, duration),
             status = COALESCE($5, status)
         WHERE id = $1 
         RETURNING *`,
        [id, date, time, duration, status],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      console.log("Update successful:", result.rows[0].id); // Debug
      return res.json(result.rows[0]);
    }

    // Handle STATUS UPDATE operation
    if (action === "status") {
      if (!id) {
        return res.status(400).json({ error: "ID is required for status update" });
      }

      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      console.log("Updating status for booking", id, "to", status); // Debug

      const result = await pool.query(
        `UPDATE bookings 
         SET status = $2
         WHERE id = $1 
         RETURNING *`,
        [id, status],
      );

      if (result.rows.length === 0) {
        console.log("Booking not found for ID:", id); // Debug
        return res.status(404).json({ error: "Booking not found" });
      }

      console.log("Status update successful:", result.rows[0]); // Debug
      return res.json(result.rows[0]);
    }

    return res.status(400).json({ error: "Invalid action. Use: delete, update, or status" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}
