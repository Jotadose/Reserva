// Test para verificar las correcciones de disponibilidad
const baseUrl = "http://localhost:3001";

async function testAvailabilityCorrections() {
  console.log("🧪 Testing availability corrections...");

  // Test para el 25 de agosto (tiene reserva a las 09:00)
  const testDate = "2025-08-25";

  try {
    console.log(`\n1️⃣ Checking availability for ${testDate}:`);
    const response = await fetch(
      `${baseUrl}/api/bookings/availability?date=${testDate}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Available slots:", data.availableSlots);
      console.log("Total available:", data.availableSlots.length);

      // Verificar que las 09:00 NO están disponibles
      const has9am = data.availableSlots.includes("09:00");
      console.log(`\n📊 Verification:`);
      console.log(
        `- 09:00 available: ${has9am} (should be false since it's booked)`
      );

      if (!has9am) {
        console.log("✅ SUCCESS: 09:00 is correctly NOT available");
      } else {
        console.log("❌ FAILURE: 09:00 should not be available");
      }
    } else {
      console.log(`❌ Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  }
}

testAvailabilityCorrections();
