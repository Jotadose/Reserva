Run the API database schema against your production database.

This repo includes `run-schema.cjs` which reads `POSTGRES_URL` from `api/.env.production` and executes `api/schema.sql`.

Usage (local machine):

1. Ensure you have a valid `api/.env.production` containing `POSTGRES_URL` (you can generate it with `vercel env pull .env.production`).
2. Run: `node api/run-schema.cjs`

This will apply `api/schema.sql` (idempotent). Use with caution on production databases.
