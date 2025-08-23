// Test completo de bloqueo de duración usando frontend
const baseUrl = "http://localhost:5173";

async function testDurationBlockingComplete() {
  console.log("🧪 Testing complete duration blocking...");

  const testDate = "2025-01-24"; // Viernes
  const testTime = "09:00";

  try {
    // 1. Verificar disponibilidad inicial
    console.log("\n1️⃣ Checking initial availability...");
    const initialResponse = await fetch(
      `${baseUrl}/api/bookings/availability?date=${testDate}`
    );
    const initialData = await initialResponse.json();
    console.log(
      "✅ Initial available slots:",
      initialData.availableSlots.length
    );
    console.log(
      "Available at 09:00:",
      initialData.availableSlots.includes("09:00")
    );
    console.log(
      "Available at 09:45:",
      initialData.availableSlots.includes("09:45")
    );

    // 2. Crear reserva de 90 minutos
    console.log("\n2️⃣ Creating 90-minute booking at 09:00...");
    const bookingData = {
      name: "Test User Duration",
      phone: "+123456789",
      email: "testduration@example.com",
      date: testDate,
      time: testTime,
      service: "Servicio Premium (90 min)",
      notes: "Test booking for 90-minute duration blocking",
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
      `📅 Booking result: ${createResponse.status} - ${createResult}`
    );

    if (createResponse.status === 201) {
      console.log("✅ Booking created successfully!");

      // 3. Verificar disponibilidad después de la reserva
      console.log("\n3️⃣ Checking availability after booking...");
      const afterResponse = await fetch(
        `${baseUrl}/api/bookings/availability?date=${testDate}`
      );
      const afterData = await afterResponse.json();

      console.log(
        "✅ Available slots after booking:",
        afterData.availableSlots.length
      );

      // Verificar que ambos slots están bloqueados
      const has9am = afterData.availableSlots.includes("09:00");
      const has945am = afterData.availableSlots.includes("09:45");

      console.log("\n📊 Duration blocking verification:");
      console.log(`- 09:00 available: ${has9am} (should be false)`);
      console.log(`- 09:45 available: ${has945am} (should be false)`);

      if (!has9am && !has945am) {
        console.log(
          "🎉 SUCCESS: Both 09:00 and 09:45 slots are correctly blocked for 90-minute service!"
        );
      } else if (!has9am && has945am) {
        console.log(
          "⚠️  PARTIAL: 09:00 blocked but 09:45 still available - duration blocking not working fully"
        );
      } else if (has9am && !has945am) {
        console.log(
          "❌ ERROR: 09:00 available but 09:45 blocked - unexpected behavior"
        );
      } else {
        console.log(
          "❌ FAILURE: Both slots still available - booking did not work"
        );
      }
    } else if (createResponse.status === 409) {
      console.log(
        "⚠️  Conflict: Time slot already booked. Checking existing booking..."
      );

      // Verificar disponibilidad para ver estado actual
      const conflictResponse = await fetch(
        `${baseUrl}/api/bookings/availability?date=${testDate}`
      );
      const conflictData = await conflictResponse.json();

      const has9am = conflictData.availableSlots.includes("09:00");
      const has945am = conflictData.availableSlots.includes("09:45");

      console.log("\n📊 Current blocking status:");
      console.log(`- 09:00 available: ${has9am}`);
      console.log(`- 09:45 available: ${has945am}`);

      if (!has9am && !has945am) {
        console.log(
          "✅ Both slots are already correctly blocked by existing booking"
        );
      } else {
        console.log(
          "⚠️  Existing booking exists but duration blocking may not be working correctly"
        );
      }
    } else {
      console.log("❌ Booking failed with status:", createResponse.status);
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

testDurationBlockingComplete();
