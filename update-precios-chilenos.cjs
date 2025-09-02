const { createClient } = require("@supabase/supabase-js");

// Configuración de Supabase
const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://vljrpydpyxqstkbfbssg.supabase.co";
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsanJweWRweXhxc3RrYmZic3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NTUzODAsImV4cCI6MjA1MjIzMTM4MH0.JmkcNHN_5cUDj6kpWrX9Ps1OtUKECyDBs7bOxRJPu2E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePreciosChilenos() {
  console.log("🔧 Actualizando precios de servicios a pesos chilenos...");

  // Precios realistas para una barbería en Chile (2025)
  const serviciosActualizados = [
    {
      buscar: "corte",
      nombre: "Corte de Cabello",
      precio: 15000, // $15.000 CLP
      descripcion:
        "Corte de cabello con asesoría, cortesía de perfilado de cejas y diseños simples, lavado de cabello, aplicación de productos y styling.",
      duracion: 45,
      categoria: "barberia",
    },
    {
      buscar: "barba",
      nombre: "Barba Profesional",
      precio: 8000, // $8.000 CLP
      descripcion:
        "El servicio de barba, es realizado con productos profesionales de la marca Nishman, productos tales como, shaving gel, after shave cream.",
      duracion: 30,
      categoria: "barberia",
    },
    {
      buscar: "limpieza",
      nombre: "Limpieza Facial",
      precio: 12000, // $12.000 CLP
      descripcion:
        "Limpieza facial profunda con productos profesionales para cuidado de la piel.",
      duracion: 40,
      categoria: "extras",
    },
  ];

  try {
    // Obtener servicios existentes
    const { data: serviciosExistentes, error: errorSelect } = await supabase
      .from("servicios")
      .select("*");

    if (errorSelect) {
      console.error("❌ Error obteniendo servicios:", errorSelect);
      return;
    }

    console.log(
      "📋 Servicios existentes encontrados:",
      serviciosExistentes?.length || 0
    );

    // Actualizar o crear servicios
    for (const servicio of serviciosActualizados) {
      const servicioExistente = serviciosExistentes?.find((s) =>
        s.nombre.toLowerCase().includes(servicio.buscar.toLowerCase())
      );

      if (servicioExistente) {
        console.log(`🔄 Actualizando ${servicioExistente.nombre}...`);

        const { error } = await supabase
          .from("servicios")
          .update({
            precio: servicio.precio,
            descripcion: servicio.descripcion,
            duracion: servicio.duracion,
            categoria: servicio.categoria,
          })
          .eq("id_servicio", servicioExistente.id_servicio);

        if (error) {
          console.error(
            `❌ Error actualizando ${servicioExistente.nombre}:`,
            error
          );
        } else {
          console.log(
            `✅ ${servicioExistente.nombre} → $${servicio.precio.toLocaleString(
              "es-CL"
            )} CLP`
          );
        }
      } else {
        // Crear nuevo servicio si no existe
        console.log(`➕ Creando nuevo servicio: ${servicio.nombre}...`);

        const { error } = await supabase.from("servicios").insert([
          {
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            precio: servicio.precio,
            duracion: servicio.duracion,
            categoria: servicio.categoria,
            activo: true,
            color: "#F59E0B", // Color amarillo por defecto
          },
        ]);

        if (error) {
          console.error(`❌ Error creando ${servicio.nombre}:`, error);
        } else {
          console.log(
            `✅ ${servicio.nombre} creado → $${servicio.precio.toLocaleString(
              "es-CL"
            )} CLP`
          );
        }
      }
    }

    // Verificar resultados finales
    const { data: serviciosFinales } = await supabase
      .from("servicios")
      .select("*")
      .eq("activo", true)
      .order("precio", { ascending: true });

    console.log("\n🎉 SERVICIOS ACTUALIZADOS:");
    console.log("================================");
    serviciosFinales?.forEach((s) => {
      console.log(`📌 ${s.nombre}`);
      console.log(`   💰 Precio: $${s.precio.toLocaleString("es-CL")} CLP`);
      console.log(`   ⏰ Duración: ${s.duracion} minutos`);
      console.log(`   📝 ${s.descripcion}`);
      console.log("   ────────────────────────────");
    });

    console.log(
      `\n✨ Total de servicios activos: ${serviciosFinales?.length || 0}`
    );
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

updatePreciosChilenos();
