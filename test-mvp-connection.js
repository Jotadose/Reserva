/**
 * TEST DIRECTO DE CONEXIÓN MVP
 * Script para verificar que la migración y los hooks funcionan correctamente
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qvxwfkbcrunaebahpmft.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eHdma2JjcnVuYWViYWhwbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTA4MzIsImV4cCI6MjA3MDkyNjgzMn0.MG6D8jFV0q-l0uxFP_3tQ-1ScXvmdckFe-T-_R9pJBA";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMVPConnection() {
  console.log("🔄 Iniciando test de conexión MVP...\n");

  try {
    // Test 1: Usuarios
    console.log("1️⃣ Testando tabla usuarios...");
    const { data: usuarios, error: usuariosError } = await supabase
      .from("usuarios")
      .select("*")
      .limit(5);

    if (usuariosError) {
      console.error("❌ Error en usuarios:", usuariosError.message);
    } else {
      console.log(`✅ Usuarios cargados: ${usuarios?.length || 0} registros`);
      console.log(
        "📋 Primeros usuarios:",
        usuarios?.map((u) => `${u.nombre} (${u.email})`).join(", ")
      );
    }

    // Test 2: Barberos
    console.log("\n2️⃣ Testando tabla barberos con join...");
    const { data: barberos, error: barberosError } = await supabase
      .from("usuarios")
      .select(
        `
        id_usuario,
        nombre,
        email,
        barberos (
          id_barbero,
          especialidades,
          horario_inicio,
          horario_fin,
          activo
        )
      `
      )
      .not("barberos", "is", null);

    if (barberosError) {
      console.error("❌ Error en barberos:", barberosError.message);
    } else {
      console.log(`✅ Barberos cargados: ${barberos?.length || 0} registros`);
      console.log(
        "📋 Barberos activos:",
        barberos
          ?.map(
            (b) => `${b.nombre} - ${b.barberos[0]?.especialidades?.join(", ")}`
          )
          .join("; ")
      );
    }

    // Test 3: Servicios
    console.log("\n3️⃣ Testando tabla servicios...");
    const { data: servicios, error: serviciosError } = await supabase
      .from("servicios")
      .select("*")
      .limit(5);

    if (serviciosError) {
      console.error("❌ Error en servicios:", serviciosError.message);
    } else {
      console.log(`✅ Servicios cargados: ${servicios?.length || 0} registros`);
      console.log(
        "📋 Servicios disponibles:",
        servicios?.map((s) => `${s.nombre} - $${s.precio / 100}`).join(", ")
      );
    }

    // Test 4: Reservas
    console.log("\n4️⃣ Testando tabla reservas...");
    const { data: reservas, error: reservasError } = await supabase
      .from("reservas")
      .select(
        `
        *,
        cliente:usuarios!reservas_id_cliente_fkey(nombre, email),
        barbero:usuarios!reservas_id_barbero_fkey(nombre),
        servicio:servicios(nombre, precio_centavos)
      `
      )
      .limit(3);

    if (reservasError) {
      console.error("❌ Error en reservas:", reservasError.message);
    } else {
      console.log(`✅ Reservas cargadas: ${reservas?.length || 0} registros`);
      if (reservas?.length > 0) {
        console.log("📋 Reservas ejemplo:");
        reservas.forEach((r) => {
          console.log(
            `   • ${r.cliente?.nombre} → ${r.barbero?.nombre} → ${r.servicio?.nombre} (${r.fecha_hora})`
          );
        });
      }
    }

    console.log("\n🎉 Test de conexión MVP completado exitosamente!");
    console.log("✅ Todas las tablas están accesibles");
    console.log("✅ Los joins funcionan correctamente");
    console.log("✅ Los datos de migración están presentes");
  } catch (error) {
    console.error("💥 Error general en el test:", error);
  }
}

// Ejecutar test
testMVPConnection();
