/**
 * test-duration-blocking.js
 * Script para probar que servicios de larga duración bloquean múltiples slots
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
  console.log("Testing duration blocking at", base);

  // Test: crear una reserva de 90 minutos (debe bloquear 2 slots)
  const testBooking = {
    name: "Test Duration User",
    phone: "+56900000000",
    email: "testduration@example.com",
    date: "2025-08-24",
    time: "09:00",
    services: [
      {
        id: "s7",
        name: "Visos",
        duration: 90,
        price: 60000,
        category: "colorimetria",
      },
    ], // 90 minutos
  };

  console.log("\\n1. Verificando disponibilidad ANTES de la reserva...");
  const availBefore = await fetchJson(
    `${base}/api/bookings/availability?date=2025-08-24`
  );
  console.log("Disponibilidad antes:", availBefore.status);
  if (availBefore.status === 200) {
    const slotsAvailBefore = availBefore.body.slots.filter((s) => s.available);
    console.log(
      "Slots disponibles ANTES:",
      slotsAvailBefore.map((s) => s.time).slice(0, 5),
      "..."
    );
  }

  console.log("\\n2. Creando reserva de 90 minutos (09:00-10:30)...");
  const createRes = await fetchJson(`${base}/api/bookings`, {
    method: "POST",
    body: testBooking,
  });
  console.log("Creación:", createRes.status, createRes.body?.error || "OK");

  console.log("\\n3. Verificando disponibilidad DESPUÉS de la reserva...");
  const availAfter = await fetchJson(
    `${base}/api/bookings/availability?date=2025-08-24`
  );
  console.log("Disponibilidad después:", availAfter.status);
  if (availAfter.status === 200) {
    const slotsAfter = availAfter.body.slots;
    const unavailableSlots = slotsAfter.filter((s) => !s.available);
    console.log(
      "Slots OCUPADOS después:",
      unavailableSlots.map((s) => s.time)
    );

    // Verificar que 09:00 y 09:45 están ocupados (servicio de 90 min)
    const slot900 = slotsAfter.find((s) => s.time === "09:00");
    const slot945 = slotsAfter.find((s) => s.time === "09:45");
    const slot1030 = slotsAfter.find((s) => s.time === "10:30");

    console.log("\\n4. Verificación de bloqueo:");
    console.log(
      "- 09:00 disponible:",
      slot900?.available,
      "(debería ser false)"
    );
    console.log(
      "- 09:45 disponible:",
      slot945?.available,
      "(debería ser false)"
    );
    console.log(
      "- 10:30 disponible:",
      slot1030?.available,
      "(debería ser true)"
    );

    if (!slot900?.available && !slot945?.available && slot1030?.available) {
      console.log(
        "\\n✅ SUCCESS: Servicio de 90 minutos bloquea correctamente 2 slots"
      );
    } else {
      console.log("\\n❌ FAIL: El bloqueo de slots no funciona correctamente");
    }
  }

  console.log("\\n5. Limpiando: eliminando reserva de prueba...");
  // Buscar y eliminar la reserva de prueba
  const bookings = await fetchJson(`${base}/api/bookings?date=2025-08-24`);
  if (bookings.status === 200 && bookings.body.length > 0) {
    const testBookingInDb = bookings.body.find(
      (b) => b.email === "testduration@example.com"
    );
    if (testBookingInDb) {
      const deleteRes = await fetchJson(
        `${base}/api/bookings/${testBookingInDb.id}`,
        { method: "DELETE" }
      );
      console.log("Eliminación:", deleteRes.status === 204 ? "OK" : "FAIL");
    }
  }
}

run().catch((err) => {
  console.error("Test failed", err);
  process.exit(1);
});
