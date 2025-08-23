// Test del endpoint base de bookings
const baseUrl = "https://reserva-4pyqtafzq-jotadoses-projects.vercel.app";

async function testBaseBookingsAPI() {
  console.log("🧪 Testing base bookings API...");

  try {
    // Test bookings endpoint
    console.log("\n1️⃣ Testing /api/bookings...");
    const response = await fetch(`${baseUrl}/api/bookings`);

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Bookings found:", data.length);
    } else {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
    }

    // Test availability with different approach
    console.log("\n2️⃣ Testing availability as query param...");
    const availResponse = await fetch(
      `${baseUrl}/api/bookings?action=availability&date=2025-08-25`
    );
    console.log("Availability Status:", availResponse.status);
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testBaseBookingsAPI();
