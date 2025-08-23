// Test básico del nuevo deployment
const baseUrl = "https://reserva-hqq1uljll-jotadoses-projects.vercel.app";

async function testBasicEndpoints() {
  console.log("🧪 Testing basic endpoints...");

  try {
    // Test 1: Frontend
    console.log("\n1️⃣ Testing frontend...");
    const frontendResponse = await fetch(baseUrl);
    console.log("Frontend Status:", frontendResponse.status);

    // Test 2: Basic bookings endpoint
    console.log("\n2️⃣ Testing /api/bookings...");
    const bookingsResponse = await fetch(`${baseUrl}/api/bookings`);
    console.log("Bookings Status:", bookingsResponse.status);
    if (bookingsResponse.ok) {
      const bookings = await bookingsResponse.json();
      console.log("✅ Bookings count:", bookings.length);
    }

    // Test 3: Availability endpoint
    console.log("\n3️⃣ Testing /api/availability...");
    const availResponse = await fetch(
      `${baseUrl}/api/availability?date=2025-08-25`
    );
    console.log("Availability Status:", availResponse.status);
    if (availResponse.ok) {
      const data = await availResponse.json();
      console.log("✅ Available slots:", data.availableSlots?.length || 0);
    } else {
      const errorText = await availResponse.text();
      console.log("❌ Error:", errorText.substring(0, 200) + "...");
    }

    // Test 4: Try old availability endpoint
    console.log("\n4️⃣ Testing old /api/bookings/availability...");
    const oldAvailResponse = await fetch(
      `${baseUrl}/api/bookings/availability?date=2025-08-25`
    );
    console.log("Old Availability Status:", oldAvailResponse.status);
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testBasicEndpoints();
