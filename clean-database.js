// Script para revisar y limpiar reservas en la base de datos
const baseUrl = "http://localhost:3001";

async function cleanDatabase() {
  console.log("🗄️ Cleaning test bookings from database...");

  try {
    // 1. Ver todas las reservas actuales
    console.log("\n1️⃣ Current bookings in database:");
    const response = await fetch(`${baseUrl}/api/bookings`);

    if (response.ok) {
      const bookings = await response.json();
      console.log(`Found ${bookings.length} bookings:`);

      bookings.forEach((booking, index) => {
        console.log(
          `${index + 1}. ID: ${booking.id} | Date: ${booking.date} | Time: ${
            booking.time
          } | Name: ${booking.name}`
        );
      });

      // 2. Eliminar reservas de prueba (las que tienen nombres de test)
      console.log("\n2️⃣ Deleting test bookings...");
      let deletedCount = 0;

      for (const booking of bookings) {
        // Eliminar reservas que son claramente de test
        if (
          booking.name &&
          (booking.name.includes("Test") ||
            booking.name.includes("test") ||
            booking.email?.includes("test") ||
            booking.email?.includes("@example.com"))
        ) {
          console.log(
            `Deleting test booking: ${booking.name} (ID: ${booking.id})`
          );

          const deleteResponse = await fetch(
            `${baseUrl}/api/bookings/${booking.id}`,
            {
              method: "DELETE",
            }
          );

          if (deleteResponse.ok) {
            console.log(`✅ Deleted booking ID: ${booking.id}`);
            deletedCount++;
          } else {
            console.log(`❌ Failed to delete booking ID: ${booking.id}`);
          }
        }
      }

      console.log(
        `\n🧹 Cleanup complete! Deleted ${deletedCount} test bookings.`
      );

      // 3. Verificar estado final
      console.log("\n3️⃣ Final database state:");
      const finalResponse = await fetch(`${baseUrl}/api/bookings`);
      if (finalResponse.ok) {
        const finalBookings = await finalResponse.json();
        console.log(`Remaining bookings: ${finalBookings.length}`);
        finalBookings.forEach((booking, index) => {
          console.log(
            `${index + 1}. ID: ${booking.id} | Date: ${booking.date} | Time: ${
              booking.time
            } | Name: ${booking.name}`
          );
        });
      }
    } else {
      console.log(`❌ Failed to fetch bookings: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error cleaning database:", error.message);
  }
}

cleanDatabase();
