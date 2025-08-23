// Test directo a la API sin pasar por Vite
const baseUrl = "http://localhost:3001";

async function testDirectAPI() {
  console.log("🧪 Testing API directly...");

  const testDate = "2025-01-24"; // Viernes

  try {
    // 1. Test availability endpoint directo
    console.log("\n1️⃣ Testing availability endpoint directly...");
    const response = await fetch(
      `${baseUrl}/api/bookings/availability?date=${testDate}`
    );

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Response data:", JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testDirectAPI();
