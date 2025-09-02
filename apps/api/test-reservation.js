/**
 * test-reservation.js
 * Simple script to test bookings API conflict handling.
 * Usage:
 *   node api/test-reservation.js --url=http://localhost:3000
 * Or set BOOKING_API_URL env var.
 */
const https = require("https");
const http = require("http");
const { URL } = require("url");

function fetchJson(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "https:" ? https : http;
    const body = opts.body ? JSON.stringify(opts.body) : null;
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      opts.headers || {}
    );
    const req = lib.request(
      u,
      { method: opts.method || "GET", headers },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          const status = res.statusCode;
          let json = null;
          try {
            json = data ? JSON.parse(data) : null;
          } catch (e) {
            json = data;
          }
          resolve({ status, body: json });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  const arg = process.argv.slice(2).find((a) => a.startsWith("--url="));
  const base =
    process.env.BOOKING_API_URL ||
    (arg ? arg.split("=")[1] : "http://localhost:3000");
  console.log("Testing bookings API at", base);

  const testBooking = {
    name: "Test User",
    phone: "+56900000000",
    email: "test@example.com",
    date: "2025-08-23",
    time: "09:00",
    services: [{ id: "s1", name: "Test Service", duration: 45, price: 100 }],
  };

  console.log("Creating initial booking...");
  const res1 = await fetchJson(`${base}/api/bookings`, {
    method: "POST",
    body: testBooking,
  });
  console.log("First create:", res1.status, res1.body || "no body");

  console.log("Attempting to create duplicate booking (should get 409)...");
  const res2 = await fetchJson(`${base}/api/bookings`, {
    method: "POST",
    body: testBooking,
  });
  console.log("Second create:", res2.status, res2.body || "no body");

  if (res2.status === 409) {
    console.log("SUCCESS: API correctly rejects duplicate bookings with 409.");
  } else {
    console.log("WARNING: API did not return 409 for duplicate booking.");
  }
}

run().catch((err) => {
  console.error("Test failed", err);
  process.exit(1);
});
