#!/usr/bin/env node
// run-schema.cjs
// Loads POSTGRES_URL from ../.env.production (created by `vercel env pull .env.production`) and executes api/schema.sql
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.production'), override: false });

const SQL_FILE = path.resolve(__dirname, 'schema.sql');
if (!fs.existsSync(SQL_FILE)) {
  console.error('schema.sql not found in api/. Make sure api/schema.sql exists.');
  process.exit(1);
}

const sql = fs.readFileSync(SQL_FILE, 'utf8');
const pgUrl = process.env.POSTGRES_URL;
if (!pgUrl) {
  console.error('POSTGRES_URL is empty in .env.production. Run `vercel env add POSTGRES_URL production` and then `vercel env pull .env.production`.');
  process.exit(2);
}

function maskUrl(u) {
  try {
    const url = new URL(u);
    return `${url.protocol}//${url.username}:*****@${url.hostname}:${url.port}${url.pathname}`;
  } catch (e) {
    return '***';
  }
}

console.log('Connecting to', maskUrl(pgUrl));

const client = new Client({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    await client.connect();
    console.log('Connected. Executing schema...');
    await client.query(sql);
    console.log('Schema executed successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Error executing schema:', err && err.message ? err.message : err);
    process.exit(3);
  }
})();
