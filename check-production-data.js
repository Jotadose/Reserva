// Verificar reservas en producción
const baseUrl = "https://reserva-hqq1uljll-jotadoses-projects.vercel.app";

async function checkProductionBookings() {
  console.log("🧪 Checking production bookings...");

  try {
    // Ver todas las reservas
    console.log("\n1️⃣ All bookings in production:");
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

      // Buscar reservas para el 25 de agosto específicamente
      const aug25Bookings = bookings.filter(
        (b) =>
          b.date &&
          (b.date.includes("2025-08-25") ||
            new Date(b.date).toISOString().includes("2025-08-25"))
      );

      console.log(`\n📊 Bookings for 2025-08-25: ${aug25Bookings.length}`);
      aug25Bookings.forEach((booking) => {
        console.log(
          `- ID: ${booking.id} | Time: ${booking.time} | Start: ${booking.start_ts} | End: ${booking.end_ts}`
        );
      });
    } else {
      console.log(`❌ Failed to fetch bookings: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkProductionBookings();
