// Script para actualizar servicios con precios chilenos realistas
import { supabaseClient } from "./src/lib/supabaseClient.ts";

async function updateServiciosPrecios() {
  console.log("🔧 Actualizando precios de servicios a pesos chilenos...");

  // Precios realistas para una barbería en Chile (2025)
  const serviciosActualizados = [
    {
      nombre: "Corte de Cabello",
      precio: 15000, // $15.000 CLP
      descripcion:
        "Corte de cabello con asesoría, cortesía de perfilado de cejas y diseños simples, lavado de cabello, aplicación de productos y styling.",
      duracion: 45,
      categoria: "barberia",
    },
    {
      nombre: "Corte de cabello + Barba",
      precio: 22000, // $22.000 CLP
      descripcion:
        "El servicio incluye corte de cabello con asesoría, cortesía de perfilado de cejas y diseños simples, lavado de cabello, aplicación de productos.",
      duracion: 90,
      categoria: "barberia",
    },
    {
      nombre: "Corte de cabello + limpieza facial",
      precio: 25000, // $25.000 CLP
      descripcion:
        "Corte de cabello con asesoría y cortesías de perfilado de cejas y diseños simples, lavado de cabello, aplicación de productos.",
      duracion: 60,
      categoria: "barberia",
    },
    {
      nombre: "Barba",
      precio: 8000, // $8.000 CLP
      descripcion:
        "El servicio de barba, es realizado con productos profesionales de la marca Nishman, productos tales como, shaving gel, after shave cream.",
      duracion: 30,
      categoria: "barberia",
    },
    {
      nombre: "Corte de cabello + Barba + Limpieza facial",
      precio: 35000, // $35.000 CLP
      descripcion:
        "Servicio completo premium con corte de cabello, barba profesional y limpieza facial profunda.",
      duracion: 120,
      categoria: "barberia",
    },
  ];

  try {
    // Obtener servicios existentes
    const { data: serviciosExistentes } = await supabaseClient
      .from("servicios")
      .select("*");

    console.log("📋 Servicios existentes:", serviciosExistentes);

    // Actualizar precios de servicios existentes
    for (const servicio of serviciosActualizados) {
      const servicioExistente = serviciosExistentes?.find((s) =>
        s.nombre
          .toLowerCase()
          .includes(servicio.nombre.toLowerCase().split(" ")[0])
      );

      if (servicioExistente) {
        console.log(`🔄 Actualizando ${servicioExistente.nombre}...`);

        const { error } = await supabaseClient
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
            `✅ ${servicioExistente.nombre} actualizado correctamente`
          );
        }
      } else {
        // Crear nuevo servicio si no existe
        console.log(`➕ Creando nuevo servicio: ${servicio.nombre}...`);

        const { error } = await supabaseClient.from("servicios").insert([
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
          console.log(`✅ ${servicio.nombre} creado correctamente`);
        }
      }
    }

    // Verificar resultados
    const { data: serviciosFinales } = await supabaseClient
      .from("servicios")
      .select("*")
      .eq("activo", true);

    console.log("🎉 Servicios actualizados:");
    serviciosFinales?.forEach((s) => {
      console.log(
        `- ${s.nombre}: $${s.precio.toLocaleString("es-CL")} CLP (${
          s.duracion
        } min)`
      );
    });
  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

updateServiciosPrecios();
