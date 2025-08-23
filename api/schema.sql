-- API for Reserva app
-- PostgreSQL table for bookings

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  email VARCHAR(100),
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  services JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure no two bookings can occupy the same date+time
CREATE UNIQUE INDEX IF NOT EXISTS bookings_date_time_uidx ON bookings(date, time);

-- Add duration, status and timestamp range columns (idempotent)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration INT DEFAULT 45;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_ts TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_ts TIMESTAMPTZ;

-- Enable btree_gist for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;
-- Populate existing rows to ensure start_ts/end_ts are set
UPDATE bookings SET duration = 45 WHERE duration IS NULL;
UPDATE bookings SET start_ts = (date::text || ' ' || time)::timestamptz WHERE start_ts IS NULL AND date IS NOT NULL AND time IS NOT NULL;
UPDATE bookings SET end_ts = start_ts + (duration || ' minutes')::interval WHERE end_ts IS NULL AND start_ts IS NOT NULL;

-- Optional: check for overlapping existing bookings (should be resolved manually if any rows returned)
-- SELECT b1.id AS id1, b2.id AS id2 FROM bookings b1 JOIN bookings b2 ON b1.id < b2.id AND tstzrange(b1.start_ts, b1.end_ts) && tstzrange(b2.start_ts, b2.end_ts) LIMIT 50;

-- Add exclusion constraint to prevent overlapping bookings (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_no_overlap EXCLUDE USING GIST (
        tstzrange(start_ts, end_ts) WITH &&
      );
  END IF;
END$$;
