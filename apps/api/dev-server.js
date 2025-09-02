// Simple dev server (CommonJS) to run the bookings API locally on port 3001
// Usage: node api/dev-server.js
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('dev-server: Error fetching bookings', err);
    res.status(500).json({ error: 'Error fetching bookings', detail: err && err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { name, phone, email, date, time, services } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO bookings (name, phone, email, date, time, services) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, phone, email, date, time, JSON.stringify(services)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('dev-server: Error creating booking', err);
    res.status(500).json({ error: 'Error creating booking', detail: err && err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error('dev-server: Error deleting booking', err);
    res.status(500).json({ error: 'Error deleting booking', detail: err && err.message });
  }
});

const port = process.env.DEV_API_PORT || 3001;
app.listen(port, () => {
  console.log(`Dev API server listening on http://localhost:${port}`);
});
