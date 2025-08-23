// Test del deployment más reciente en producción
const baseUrl = "https://reserva-hqq1uljll-jotadoses-projects.vercel.app";

async function testProductionAPI() {
  console.log("🧪 Testing production API...");

  const testDate = "2025-08-25"; // Lunes con reserva en 09:00

  try {
    // Test availability endpoint
    console.log("\n1️⃣ Testing availability endpoint...");
    const response = await fetch(
      `${baseUrl}/api/availability?date=${testDate}`
    );

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Response data:", JSON.stringify(data, null, 2));

      if (data.availableSlots) {
        console.log(`📊 Available slots: ${data.availableSlots.length}`);
        console.log(
          "- 09:00 available:",
          data.availableSlots.includes("09:00")
        );
        console.log(
          "- 09:45 available:",
          data.availableSlots.includes("09:45")
        );
      }
    } else {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

testProductionAPI();
