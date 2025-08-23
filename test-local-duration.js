const baseUrl = "http://localhost:5173";

async function testLocalDurationBlocking() {
  console.log("🧪 Testing duration blocking locally...");

  const testDate = "2025-01-24"; // Viernes
  const testTime = "09:00";

  try {
    // 1. Verificar disponibilidad antes
    console.log("\n1️⃣ Checking availability before booking...");
    const availabilityResponse = await fetch(
      `${baseUrl}/api/bookings/availability?date=${testDate}`
    );

    if (!availabilityResponse.ok) {
      console.log(
        `❌ Availability check failed: ${availabilityResponse.status} ${availabilityResponse.statusText}`
      );
      console.log("Response text:", await availabilityResponse.text());
      return;
    }

    const availability = await availabilityResponse.json();
    console.log("✅ Available slots:", availability.availableSlots);

    // 2. Crear reserva de 90 minutos a las 09:00
    console.log("\n2️⃣ Creating 90-minute booking at 09:00...");
    const bookingData = {
      name: "Test User",
      phone: "+123456789",
      email: "test@example.com",
      date: testDate,
      time: testTime,
      service: "Servicio Premium (90 min)", // Servicio de 90 minutos
      notes: "Test booking for duration blocking",
    };

    const createResponse = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const createResult = await createResponse.text();
    console.log(
      `📅 Booking creation: ${createResponse.status} - ${createResult}`
    );

    // 3. Verificar disponibilidad después
    console.log("\n3️⃣ Checking availability after booking...");
    const availabilityAfter = await fetch(
      `${baseUrl}/api/bookings/availability?date=${testDate}`
    );

    if (availabilityAfter.ok) {
      const availabilityAfterData = await availabilityAfter.json();
      console.log(
        "✅ Available slots after booking:",
        availabilityAfterData.availableSlots
      );

      // Verificar que tanto 09:00 como 09:45 están bloqueados
      const has9am = availabilityAfterData.availableSlots.includes("09:00");
      const has945am = availabilityAfterData.availableSlots.includes("09:45");

      console.log("\n📊 Duration blocking analysis:");
      console.log(`- 09:00 available: ${has9am} (should be false)`);
      console.log(`- 09:45 available: ${has945am} (should be false)`);

      if (!has9am && !has945am) {
        console.log("✅ SUCCESS: Both slots are correctly blocked!");
      } else {
        console.log("❌ FAILURE: Duration blocking not working properly");
      }
    } else {
      console.log(
        `❌ Availability check after failed: ${availabilityAfter.status}`
      );
    }
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Wait a bit for the dev server to be ready
setTimeout(testLocalDurationBlocking, 3000);
