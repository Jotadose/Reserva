/**
 * ===================================================================
 * API INTERMEDIA - GESTIÓN DE RESERVAS
 * ===================================================================
 *
 * API intermedia para gestión de reservas
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
        return await getReservas(req, res);
      case "POST":
        return await createReserva(req, res);
      case "PUT":
        return await updateReserva(req, res);
      case "DELETE":
        return await cancelReserva(req, res);
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

async function getReservas(req, res) {
  const { fecha, barbero, cliente, estado } = req.query;

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
      created_at,
      updated_at,
      clientes:usuarios!id_cliente (
        id_usuario,
        nombre,
        email,
        telefono
      ),
      barberos:usuarios!id_barbero (
        id_usuario,
        nombre,
        email
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

  if (fecha) {
    query = query.eq("fecha_reserva", fecha);
  }

  if (barbero) {
    query = query.eq("id_barbero", barbero);
  }

  if (cliente) {
    query = query.eq("id_cliente", cliente);
  }

  if (estado) {
    query = query.eq("estado", estado);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data: data || [],
    count: data?.length || 0,
  });
}

async function createReserva(req, res) {
  const {
    id_cliente,
    id_barbero,
    id_servicio,
    fecha_reserva,
    hora_inicio,
    notas_cliente,
  } = req.body;

  // Validación básica
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

  // Obtener información del servicio
  const { data: servicio, error: errorServicio } = await supabase
    .from("servicios")
    .select("precio, duracion")
    .eq("id_servicio", id_servicio)
    .eq("activo", true)
    .single();

  if (errorServicio || !servicio) {
    return res.status(400).json({ error: "Servicio no encontrado o inactivo" });
  }

  // Calcular hora fin
  const horaInicio = new Date(`2000-01-01T${hora_inicio}`);
  const horaFin = new Date(horaInicio.getTime() + servicio.duracion * 60000);
  const horaFinStr = horaFin.toTimeString().slice(0, 8);

  // Verificar disponibilidad del barbero
  const { data: conflictos, error: errorConflictos } = await supabase
    .from("reservas")
    .select("id_reserva")
    .eq("id_barbero", id_barbero)
    .eq("fecha_reserva", fecha_reserva)
    .in("estado", ["pendiente", "confirmada", "en_progreso"])
    .or(
      `and(hora_inicio.lte.${hora_inicio},hora_fin.gt.${hora_inicio}),and(hora_inicio.lt.${horaFinStr},hora_fin.gte.${horaFinStr}),and(hora_inicio.gte.${hora_inicio},hora_fin.lte.${horaFinStr})`
    );

  if (errorConflictos) {
    return res.status(400).json({ error: errorConflictos.message });
  }

  if (conflictos && conflictos.length > 0) {
    return res.status(400).json({
      error: "Horario no disponible",
      message: "El barbero ya tiene una reserva en ese horario",
    });
  }

  // Crear la reserva
  const { data, error } = await supabase
    .from("reservas")
    .insert({
      id_cliente,
      id_barbero,
      id_servicio,
      fecha_reserva,
      hora_inicio,
      hora_fin: horaFinStr,
      duracion_minutos: servicio.duracion,
      precio_total: servicio.precio,
      estado: "confirmada",
      notas_cliente,
      confirmada_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    success: true,
    data,
    message: "Reserva creada exitosamente",
  });
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
