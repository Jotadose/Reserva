// Script para actualizar esquema de producción
const baseUrl = "https://reserva-hqq1uljll-jotadoses-projects.vercel.app";

async function updateProductionSchema() {
  console.log("🧪 Testing schema and updating if needed...");

  try {
    // Probar crear una reserva simple para ver el error específico
    console.log("\n1️⃣ Testing simple booking creation...");
    const simpleBooking = {
      name: "Test Schema",
      phone: "+123456789",
      email: "test@schema.com",
      date: "2025-08-25",
      time: "09:00",
      service: "Servicio Básico",
      notes: "Schema test",
    };

    const createResponse = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(simpleBooking),
    });

    console.log(`📅 Simple booking creation: ${createResponse.status}`);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log(`❌ Error details: ${errorText}`);

      // Si el error menciona columnas faltantes, necesitamos ejecutar el schema
      if (
        errorText.includes("column") ||
        errorText.includes("does not exist")
      ) {
        console.log(
          "\n🔧 Schema update needed. The production database is missing new columns."
        );
        console.log(
          "ℹ️  You need to run the schema.sql on the production database:"
        );
        console.log("   1. Go to Supabase dashboard");
        console.log("   2. Navigate to SQL Editor");
        console.log("   3. Run the contents of api/schema.sql");
        console.log("   4. This will add the missing columns and constraints");
      }
    } else {
      const booking = await createResponse.json();
      console.log(`✅ Booking created successfully: ID ${booking.id}`);
      console.log(`- Has start_ts: ${booking.start_ts ? "Yes" : "No"}`);
      console.log(`- Has end_ts: ${booking.end_ts ? "Yes" : "No"}`);
      console.log(`- Has duration: ${booking.duration ? "Yes" : "No"}`);
    }
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
}

updateProductionSchema();
