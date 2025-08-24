// Vercel API route for updating booking status
import { Pool } from "pg";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const result = await pool.query(
      `UPDATE bookings 
       SET status = $2, updated_at = NOW()
       WHERE id = $1 
       RETURNING *`,
      [id, status],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
