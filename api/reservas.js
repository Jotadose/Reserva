/**
 * ===================================================================
 * API INTERMEDIA - GESTIÓN DE RESERVAS
 * ===================================================================
 *
 * API intermedia para gestión de reservas
 * Arquitectura: FRONT → API INTERMEDIA → DB SUPABASE
 */

import { supabase } from "../lib/database.js";

async function logEvent(actor, entidad, accion, metadata = {}) {
  try {
    await supabase.from("event_log").insert({
      actor: actor || null,
      entidad,
      accion,
      metadata,
    });
  } catch (e) {
    console.warn("No se pudo registrar evento", e.message);
  }
}

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
        return await getReservas(req, res);
      case "POST":
        return await createReserva(req, res);
      case "PUT":
        return await updateReserva(req, res);
      case "DELETE":
        return await softDeleteReserva(req, res);
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

async function softDeleteReserva(req, res) {
  const { id_reserva } = req.body;
  if (!id_reserva) {
    return res.status(400).json({ error: "Falta id_reserva" });
  }
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("reservas")
    .update({ deleted_at: now })
    .eq("id_reserva", id_reserva)
    .select()
    .single();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  logEvent(null, "reserva", "soft_delete", { id_reserva });
  return res.status(200).json({ success: true, data });
}
// Recuperar reservas (excluye soft deleted por defecto)
async function getReservas(req, res) {
  const { fecha, barbero, cliente, estado, incluir_eliminadas } = req.query;

  let query = supabase
    .from("reservas")
    .select(
      `
      id_reserva,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      duracion_minutos,
      precio_total,
      estado,
      notas_cliente,
      notas_internas,
      deleted_at,
      created_at,
      updated_at,
      cliente:usuarios!reservas_id_cliente_fkey (
        id_usuario,
        nombre,
        email,
        telefono
      ),
      barbero:barberos!reservas_id_barbero_fkey (
        id_barbero,
        usuario:usuarios!barberos_id_barbero_fkey(id_usuario, nombre, email)
      ),
      servicios (
        id_servicio,
        nombre,
        precio,
        duracion,
        categoria
      )
    `
    )
    .order("fecha_reserva", { ascending: false })
    .order("hora_inicio", { ascending: true });

  if (!incluir_eliminadas) {
    query = query.is("deleted_at", null);
  }
  if (fecha) query = query.eq("fecha_reserva", fecha);
  if (barbero) query = query.eq("id_barbero", barbero);
  if (cliente) query = query.eq("id_cliente", cliente);
  if (estado) query = query.eq("estado", estado);

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res
    .status(200)
    .json({ success: true, data: data || [], count: data?.length || 0 });
}

async function createReserva(req, res) {
  const {
    id_cliente,
    id_barbero,
    id_servicio, // Ahora esperamos un solo ID de servicio
    fecha_reserva,
    hora_inicio,
    notas_cliente,
  } = req.body;

  if (
    !id_cliente ||
    !id_barbero ||
    !id_servicio ||
    !fecha_reserva ||
    !hora_inicio
  ) {
    return res.status(400).json({
      error: "Faltan campos requeridos",
      required: [
        "id_cliente",
        "id_barbero",
        "id_servicio",
        "fecha_reserva",
        "hora_inicio",
      ],
    });
  }

  // Obtener el servicio para obtener su duración y precio
  const { data: servicio, error: errorServicio } = await supabase
    .from("servicios")
    .select("duracion, precio, activo")
    .eq("id_servicio", id_servicio)
    .single();

  if (errorServicio) {
    return res
      .status(400)
      .json({ error: "Servicio no encontrado o error en la consulta." });
  }
  if (!servicio || !servicio.activo) {
    return res
      .status(400)
      .json({ error: "El servicio seleccionado no existe o está inactivo." });
  }

  const totalDuracion = servicio.duracion;
  const totalPrecio = servicio.precio;

  const horaInicioDate = new Date(`2000-01-01T${hora_inicio}`);
  const horaFinDate = new Date(
    horaInicioDate.getTime() + totalDuracion * 60000
  );
  const hora_fin = horaFinDate.toTimeString().slice(0, 8);

  // Verificar conflicto con rango completo
  const { data: conflictos, error: errorConflictos } = await supabase
    .from("reservas")
    .select("id_reserva, hora_inicio, hora_fin")
    .eq("id_barbero", id_barbero)
    .eq("fecha_reserva", fecha_reserva)
    .in("estado", ["pendiente", "confirmada", "en_progreso"])
    .or(
      `and(hora_inicio.lte.${hora_inicio},hora_fin.gt.${hora_inicio}),and(hora_inicio.lt.${hora_fin},hora_fin.gte.${hora_fin}),and(hora_inicio.gte.${hora_inicio},hora_fin.lte.${hora_fin})`
    );

  if (errorConflictos) {
    return res.status(400).json({ error: errorConflictos.message });
  }
  if (conflictos && conflictos.length > 0) {
    return res.status(409).json({
      // Usar 409 Conflict para este caso específico
      error: "Horario no disponible",
      message:
        "El barbero ya tiene una reserva que se solapa con este horario.",
    });
  }

  const { data, error } = await supabase
    .from("reservas")
    .insert({
      id_cliente,
      id_barbero,
      id_servicio, // Guardamos el único id_servicio
      fecha_reserva,
      hora_inicio,
      hora_fin,
      duracion_minutos: totalDuracion,
      precio_total: totalPrecio,
      estado: "confirmada",
      notas_cliente,
      confirmada_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    // Violación de unicidad u otro
    return res.status(400).json({ error: error.message });
  }

  logEvent(null, "reserva", "create", {
    id_reserva: data.id_reserva,
    id_servicio: id_servicio,
  });
  res
    .status(201)
    .json({ success: true, data, message: "Reserva creada exitosamente" });
}

async function updateReserva(req, res) {
  const { id } = req.query;
  const {
    fecha_reserva,
    hora_inicio,
    estado,
    notas_cliente,
    notas_internas,
    motivo_cancelacion,
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID de reserva requerido" });
  }

  const updates = {};
  if (fecha_reserva !== undefined) updates.fecha_reserva = fecha_reserva;
  if (hora_inicio !== undefined) updates.hora_inicio = hora_inicio;
  if (estado !== undefined) {
    updates.estado = estado;
    if (estado === "completada") {
      updates.completada_at = new Date().toISOString();
    } else if (estado === "cancelada") {
      updates.cancelada_at = new Date().toISOString();
    }
  }
  if (notas_cliente !== undefined) updates.notas_cliente = notas_cliente;
  if (notas_internas !== undefined) updates.notas_internas = notas_internas;
  if (motivo_cancelacion !== undefined)
    updates.motivo_cancelacion = motivo_cancelacion;

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("reservas")
    .update(updates)
    .eq("id_reserva", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  logEvent(null, "reserva", "update", { id_reserva: id, cambios: updates });
  res.status(200).json({
    success: true,
    data,
    message: "Reserva actualizada exitosamente",
  });
}

async function cancelReserva(req, res) {
  const { id } = req.query;
  const { motivo_cancelacion } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID de reserva requerido" });
  }

  const { data, error } = await supabase
    .from("reservas")
    .update({
      estado: "cancelada",
      motivo_cancelacion,
      cancelada_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id_reserva", id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data,
    message: "Reserva cancelada exitosamente",
  });
}
