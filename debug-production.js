// Test paso a paso para identificar el problema
const baseUrl = "https://reserva-hqq1uljll-jotadoses-projects.vercel.app";

async function debugProductionIssue() {
  console.log("🔍 Debugging production issue...");

  try {
    // Test 1: Reserva ultra simple (sin servicios complejos)
    console.log("\n1️⃣ Testing ultra simple booking...");
    const ultraSimple = {
      name: "Test",
      phone: "123",
      email: "test@test.com",
      date: "2025-08-25",
      time: "09:00",
      service: "Test Service",
    };

    const response1 = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ultraSimple),
    });

    console.log(`Status: ${response1.status}`);
    const result1 = await response1.text();
    console.log(`Response: ${result1}`);

    if (response1.ok) {
      console.log("✅ Ultra simple booking worked!");

      // Test 2: Verificar availability después
      console.log("\n2️⃣ Checking availability after simple booking...");
      const availResponse = await fetch(
        `${baseUrl}/api/availability?date=2025-08-25`
      );
      if (availResponse.ok) {
        const data = await availResponse.json();
        console.log(`Available slots: ${data.availableSlots.length}`);
        console.log(
          `09:00 available: ${data.availableSlots.includes("09:00")}`
        );
      }
    } else {
      console.log("❌ Even ultra simple booking failed");

      // Test 3: Verificar estructura de datos esperada
      console.log("\n3️⃣ Testing with old structure...");
      const oldStructure = {
        name: "Test Old",
        phone: "123",
        email: "test@old.com",
        date: "2025-08-25",
        time: "10:30",
        services: [{ name: "Test Service", duration: 45 }], // Estructura antigua
      };

      const response3 = await fetch(`${baseUrl}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oldStructure),
      });

      console.log(`Old structure status: ${response3.status}`);
      const result3 = await response3.text();
      console.log(`Old structure response: ${result3}`);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

debugProductionIssue();
