// Test específico para verificar manejo de duplicados
const baseUrl = "http://localhost:3001";

async function testDuplicateHandling() {
  console.log("🧪 Testing duplicate booking handling...");

  try {
    const bookingData = {
      name: "Test Duplicado Debug",
      phone: "+123456789",
      email: "duplicate-debug@test.com",
      date: "2025-08-25",
      time: "09:00", // Slot ya ocupado según la base de datos
      service: "Servicio Básico (45 min)",
      notes: "Test de duplicado para debugging",
    };

    console.log("📤 Sending booking request...");
    console.log("Data:", JSON.stringify(bookingData, null, 2));

    const response = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    console.log(`📥 Response status: ${response.status}`);

    const responseText = await response.text();
    console.log("📄 Response text:", responseText);

    if (response.status === 409) {
      console.log("✅ SUCCESS: Correctly blocked duplicate");
    } else if (response.status === 500) {
      console.log("❌ ERROR 500: Server error instead of conflict");
    } else {
      console.log(`❓ UNEXPECTED: Status ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testDuplicateHandling();
