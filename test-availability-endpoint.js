// Test del nuevo endpoint de verificación de disponibilidad
const baseUrl = "https://reserva-arrpmsvdu-jotadoses-projects.vercel.app";

async function testAvailabilityEndpoint() {
  console.log("🧪 Testing availability endpoint...");

  try {
    // Test 1: Endpoint de salud
    console.log("\n1️⃣ Testing /api/health...");
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    console.log("Health Status:", healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Health check:", healthData);
    } else {
      const errorText = await healthResponse.text();
      console.log("❌ Health error:", errorText.substring(0, 200));
    }

    // Test 2: Nuevo endpoint de verificación
    console.log("\n2️⃣ Testing /api/disponibilidad/check...");
    const params = new URLSearchParams({
      barberId: "550e8400-e29b-41d4-a716-446655440002",
      date: "2025-09-06",
      startTime: "14:30",
      serviceId: "660e8400-e29b-41d4-a716-446655440005"
    });
    
    const availResponse = await fetch(`${baseUrl}/api/disponibilidad/check?${params}`);
    console.log("Availability Status:", availResponse.status);
    
    if (availResponse.ok) {
      const availData = await availResponse.json();
      console.log("✅ Availability check:", availData);
    } else {
      const errorText = await availResponse.text();
      console.log("❌ Availability error:", errorText.substring(0, 500));
    }

    // Test 3: Endpoint de reservas
    console.log("\n3️⃣ Testing /api/reservas...");
    const reservasResponse = await fetch(`${baseUrl}/api/reservas`);
    console.log("Reservas Status:", reservasResponse.status);
    
    if (reservasResponse.ok) {
      const reservasData = await reservasResponse.json();
      console.log("✅ Reservas count:", reservasData.data?.length || 0);
    } else {
      const errorText = await reservasResponse.text();
      console.log("❌ Reservas error:", errorText.substring(0, 200));
    }

  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testAvailabilityEndpoint();