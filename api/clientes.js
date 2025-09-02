/**
 * ===================================================================
 * API INTERMEDIA - GESTIÓN DE CLIENTES
 * ===================================================================
 *
 * API intermedia para gestión de clientes
 * Arquitectura: FRONT → API INTERMEDIA → DB SUPABASE
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case "GET":
        return await getClientes(req, res);
      case "POST":
        return await createCliente(req, res);
      case "PUT":
        return await updateCliente(req, res);
      case "DELETE":
        return await deleteCliente(req, res);
      default:
        res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}

async function getClientes(req, res) {
  const { data, error } = await supabase
    .from("usuarios")
    .select(
      `
      id,
      nombre,
      telefono,
      email,
      activo,
      preferencias,
      fecha_nacimiento,
      direccion,
      creado_en,
      reservas(
        id,
        fecha_reserva,
        estado,
        precio_total,
        servicios(nombre, precio)
      )
    `
    )
    .eq("rol", "cliente")
    .eq("activo", true)
    .order("creado_en", { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Calcular estadísticas por cliente
  const clientesConEstadisticas =
    data?.map((cliente) => {
      const reservas = cliente.reservas || [];
      const totalGastado = reservas.reduce(
        (sum, r) => sum + (r.precio_total || 0),
        0
      );
      const totalVisitas = reservas.length;
      const ultimaVisita =
        reservas.length > 0
          ? Math.max(
              ...reservas.map((r) => new Date(r.fecha_reserva).getTime())
            )
          : null;

      return {
        ...cliente,
        estadisticas: {
          totalVisitas,
          totalGastado,
          promedioGasto:
            totalVisitas > 0 ? Math.round(totalGastado / totalVisitas) : 0,
          ultimaVisita: ultimaVisita
            ? new Date(ultimaVisita).toISOString()
            : null,
          frecuenciaVisitas:
            totalVisitas >= 10 ? "alta" : totalVisitas >= 5 ? "media" : "baja",
        },
      };
    }) || [];

  res.status(200).json({
    success: true,
    data: clientesConEstadisticas,
    count: clientesConEstadisticas.length,
  });
}

async function createCliente(req, res) {
  const { nombre, telefono, email, fecha_nacimiento, direccion, preferencias } =
    req.body;

  // Validación básica
  if (!nombre || !telefono) {
    return res.status(400).json({
      error: "Faltan campos requeridos",
      required: ["nombre", "telefono"],
    });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      nombre,
      telefono,
      email,
      fecha_nacimiento,
      direccion,
      preferencias,
      rol: "cliente",
      activo: true,
      creado_en: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    success: true,
    data,
    message: "Cliente creado exitosamente",
  });
}

async function updateCliente(req, res) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID de cliente requerido" });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .update({
      ...updates,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("rol", "cliente")
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data,
    message: "Cliente actualizado exitosamente",
  });
}

async function deleteCliente(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID de cliente requerido" });
  }

  // Soft delete - marcar como inactivo
  const { data, error } = await supabase
    .from("usuarios")
    .update({
      activo: false,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("rol", "cliente")
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data,
    message: "Cliente desactivado exitosamente",
  });
}
