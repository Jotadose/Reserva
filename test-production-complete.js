// Test completo de funcionalidad en producción
const baseUrl = "https://reserva-knkhui5j9-jotadoses-projects.vercel.app";

async function testProductionComplete() {
  console.log("🧪 Testing complete production functionality...");

  const testDate = "2025-08-25"; // Lunes

  try {
    // 1. Verificar que la base de datos esté limpia
    console.log("\n1️⃣ Checking clean database...");
    const bookingsResponse = await fetch(`${baseUrl}/api/bookings`);
    if (bookingsResponse.ok) {
      const bookings = await bookingsResponse.json();
      console.log(`✅ Database has ${bookings.length} bookings (should be 0)`);
    }

    // 2. Verificar availability inicial
    console.log("\n2️⃣ Checking initial availability...");
    const availResponse = await fetch(
      `${baseUrl}/api/availability?date=${testDate}`
    );
    if (availResponse.ok) {
      const data = await availResponse.json();
      console.log(
        `✅ Available slots: ${data.availableSlots.length} (should be 14)`
      );
      console.log(
        `- 09:00 available: ${data.availableSlots.includes("09:00")}`
      );
      console.log(
        `- 09:45 available: ${data.availableSlots.includes("09:45")}`
      );
    }

    // 3. Crear una reserva de 90 minutos
    console.log("\n3️⃣ Creating 90-minute booking...");
    const bookingData = {
      name: "Test Production User",
      phone: "+1234567890",
      email: "test@production.com",
      date: testDate,
      time: "09:00",
      service: "Servicio Premium (90 min)",
      notes: "Test booking for production",
    };

    const createResponse = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    console.log(`📅 Booking creation: ${createResponse.status}`);
    if (createResponse.ok) {
      const booking = await createResponse.json();
      console.log(`✅ Created booking ID: ${booking.id}`);
      console.log(`- Duration: ${booking.duration} minutes`);
      console.log(`- Start: ${booking.start_ts}`);
      console.log(`- End: ${booking.end_ts}`);
    } else {
      const error = await createResponse.text();
      console.log(`❌ Error: ${error}`);
    }

    // 4. Verificar availability después de la reserva
    console.log("\n4️⃣ Checking availability after booking...");
    const availAfter = await fetch(
      `${baseUrl}/api/availability?date=${testDate}`
    );
    if (availAfter.ok) {
      const dataAfter = await availAfter.json();
      console.log(
        `✅ Available slots after: ${dataAfter.availableSlots.length}`
      );

      const has9am = dataAfter.availableSlots.includes("09:00");
      const has945am = dataAfter.availableSlots.includes("09:45");

      console.log(`📊 Duration blocking verification:`);
      console.log(`- 09:00 available: ${has9am} (should be false)`);
      console.log(`- 09:45 available: ${has945am} (should be false)`);

      if (!has9am && !has945am) {
        console.log("🎉 SUCCESS: Duration blocking working correctly!");
      } else {
        console.log("❌ FAILURE: Duration blocking not working");
      }
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

testProductionComplete();
