// Limpiar base de datos y probar desde cero
const baseUrl = "https://reserva-knkhui5j9-jotadoses-projects.vercel.app";

async function cleanAndTestFromScratch() {
  console.log("🧹 Clean database and test from scratch...");

  try {
    // 1. Ver todas las reservas actuales
    console.log("\n1️⃣ Current bookings:");
    const response = await fetch(`${baseUrl}/api/bookings`);
    if (response.ok) {
      const bookings = await response.json();
      console.log(`Found ${bookings.length} bookings:`);

      // 2. Eliminar todas las reservas
      for (const booking of bookings) {
        console.log(`Deleting booking ID: ${booking.id}`);
        const deleteResponse = await fetch(
          `${baseUrl}/api/bookings/${booking.id}`,
          {
            method: "DELETE",
          }
        );
        if (deleteResponse.ok) {
          console.log(`✅ Deleted ID: ${booking.id}`);
        } else {
          console.log(`❌ Failed to delete ID: ${booking.id}`);
        }
      }
    }

    // 3. Verificar que la base esté limpia
    console.log("\n2️⃣ Verifying clean database...");
    const cleanCheck = await fetch(`${baseUrl}/api/bookings`);
    if (cleanCheck.ok) {
      const cleanBookings = await cleanCheck.json();
      console.log(`✅ Database now has ${cleanBookings.length} bookings`);
    }

    // 4. Verificar availability con base limpia
    console.log("\n3️⃣ Checking availability with clean database...");
    const availResponse = await fetch(
      `${baseUrl}/api/availability?date=2025-08-25`
    );
    if (availResponse.ok) {
      const data = await availResponse.json();
      console.log(
        `✅ Available slots: ${data.availableSlots.length} (should be 14)`
      );
    }

    console.log("\n🎯 Database is now clean and ready for testing!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

cleanAndTestFromScratch();
