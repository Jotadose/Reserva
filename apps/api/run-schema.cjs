#!/usr/bin/env node
// run-schema.cjs
// Loads POSTGRES_URL from either api/.env.production or ../.env.production (supports both workflows)
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// Prefer api/.env.production (if you ran `vercel env pull api/.env.production`),
// otherwise fall back to ../.env.production (if you ran `vercel env pull .env.production`).
const candidatePaths = [
  path.resolve(__dirname, ".env.production"),
  path.resolve(__dirname, "..", ".env.production"),
];

let loadedEnvPath = null;
for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    require("dotenv").config({ path: p, override: false });
    loadedEnvPath = p;
    break;
  }
}

if (!loadedEnvPath) {
  // still try to load default (keeps original behavior)
  const fallback = path.resolve(__dirname, "..", ".env.production");
  require("dotenv").config({ path: fallback, override: false });
  console.log("No api/.env.production found — attempted fallback to", fallback);
} else {
  console.log("Loaded environment from", loadedEnvPath);
}

const SQL_FILE = path.resolve(__dirname, "schema.sql");
if (!fs.existsSync(SQL_FILE)) {
  console.error(
    "schema.sql not found in api/. Make sure api/schema.sql exists."
  );
  process.exit(1);
}

const sql = fs.readFileSync(SQL_FILE, "utf8");
const pgUrl = process.env.POSTGRES_URL;
if (!pgUrl) {
  console.error(
    "POSTGRES_URL is empty in the loaded env. Make sure the file contains POSTGRES_URL and that you pulled the correct env from Vercel."
  );
  if (loadedEnvPath) console.error("Loaded env path:", loadedEnvPath);
  process.exit(2);
}

function maskUrl(u) {
  try {
    const url = new URL(u);
    return `${url.protocol}//${url.username}:*****@${url.hostname}:${url.port}${url.pathname}`;
  } catch (e) {
    return "***";
  }
}

console.log("Connecting to", maskUrl(pgUrl));

const client = new Client({
  connectionString: pgUrl,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await client.connect();
    console.log("Connected. Executing schema...");
    await client.query(sql);
    console.log("Schema executed successfully.");
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error(
      "Error executing schema:",
      err && err.message ? err.message : err
    );
    process.exit(3);
  }
})();
