// Script para probar el estado actual del sistema de reservas
// y identificar qué falta por pulir

const baseUrl = "http://localhost:3001";

async function systemHealthCheck() {
  console.log("🔍 Sistema de Reservas - Análisis de Estado");
  console.log("===========================================\n");

  try {
    // 1. Test básico de availability
    console.log("1️⃣ Test de disponibilidad básica:");
    const testDate = "2025-08-25";
    const response = await fetch(
      `${baseUrl}/api/bookings/availability?date=${testDate}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log(
        `✅ API funcionando - ${data.availableSlots.length} slots disponibles`
      );
      console.log(`   Slots: ${data.availableSlots.slice(0, 3).join(", ")}...`);
    } else {
      console.log(`❌ API error: ${response.status}`);
    }

    // 2. Test de reserva duplicada (debe fallar)
    console.log("\n2️⃣ Test de prevención de duplicados:");
    const bookingData = {
      name: "Test Duplicado",
      phone: "+123456789",
      email: "duplicate@test.com",
      date: "2025-08-25",
      time: "09:00", // Slot ya ocupado
      service: "Servicio Básico (45 min)",
      notes: "Test de duplicado",
    };

    const dupResponse = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    if (dupResponse.status === 409) {
      console.log("✅ Prevención de duplicados funcionando");
    } else {
      console.log(`❌ Duplicados no bloqueados: ${dupResponse.status}`);
    }

    // 3. Verificar estado de la base de datos
    console.log("\n3️⃣ Estado de la base de datos:");
    const bookingsResponse = await fetch(`${baseUrl}/api/bookings`);
    if (bookingsResponse.ok) {
      const bookings = await bookingsResponse.json();
      console.log(`✅ ${bookings.length} reservas en total`);

      // Contar por fecha
      const byDate = {};
      bookings.forEach((b) => {
        const date = new Date(b.date).toISOString().split("T")[0];
        byDate[date] = (byDate[date] || 0) + 1;
      });

      console.log("   Distribución por fecha:");
      Object.entries(byDate).forEach(([date, count]) => {
        console.log(`   - ${date}: ${count} reservas`);
      });
    }
  } catch (error) {
    console.error("❌ Error en análisis:", error.message);
  }

  console.log("\n📋 CHECKLIST DE MEJORAS PENDIENTES:");
  console.log("==================================");
  console.log("□ Frontend: Corrección de zona horaria en fechas");
  console.log("□ Frontend: Validación de domingos/días cerrados");
  console.log("□ Frontend: Loading states mejorados");
  console.log("□ Backend: Deploy de correcciones a producción");
  console.log("□ UX: Mensajes de error más claros");
  console.log("□ UX: Confirmación de reservas");
  console.log("□ Performance: Caching de availability");
  console.log("□ Validación: Horarios de atención configurables");
  console.log("□ Administración: Panel para gestionar reservas");
}

systemHealthCheck();
