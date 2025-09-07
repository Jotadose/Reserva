/**
 * ===================================================================
 * API INTERMEDIA - GESTIÓN DE USUARIOS/CLIENTES
 * ===================================================================
 *
 * API intermedia para gestión de usuarios y clientes
 * Arquitectura: FRONT → API INTERMEDIA → DB SUPABASE
 */

import { supabase } from "../lib/database.js";

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
        return await getUsuarios(req, res);
      case "POST":
        return await createUsuario(req, res);
      case "PUT":
        return await updateUsuario(req, res);
      case "DELETE":
        return await deactivateUsuario(req, res);
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

async function getUsuarios(req, res) {
  const { rol, activo, email, telefono } = req.query;

  let query = supabase
    .from("usuarios")
    .select(
      `
      id_usuario,
      nombre,
      email,
      telefono,
      rol,
      activo,
      fecha_registro,
      created_at,
      updated_at
    `
    )
    .order("created_at", { ascending: false });

  if (rol) {
    query = query.eq("rol", rol);
  }

  if (activo !== undefined) {
    query = query.eq("activo", activo);
  }

  if (email) {
    query = query.ilike("email", `%${email}%`);
  }

  if (telefono) {
    query = query.ilike("telefono", `%${telefono}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Si es una consulta específica por rol, agregar estadísticas
  let stats = {};
  if (rol || (!email && !telefono)) {
    const { data: statsData, error: statsError } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("activo", true);

    if (!statsError && statsData) {
      stats = statsData.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1;
        return acc;
      }, {});
    }
  }

  res.status(200).json({
    success: true,
    data: data || [],
    count: data?.length || 0,
    stats,
  });
}

async function createUsuario(req, res) {
  const { nombre, email, telefono, rol = "cliente" } = req.body;

  // Validación básica
  if (!nombre || !email || !telefono) {
    return res.status(400).json({
      error: "Faltan campos requeridos",
      required: ["nombre", "email", "telefono"],
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Formato de email inválido",
    });
  }

  // Verificar que el email no exista
  const { data: existingUser } = await supabase
    .from("usuarios")
    .select("id_usuario")
    .eq("email", email)
    .single();

  if (existingUser) {
    return res.status(400).json({
      error: "Email ya registrado",
      message: "Ya existe un usuario con este email",
    });
  }

  // Crear el usuario
  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      nombre,
      email,
      telefono,
      rol,
      activo: true,
      fecha_registro: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    success: true,
    data,
    message: "Usuario creado exitosamente",
  });
}

async function updateUsuario(req, res) {
  const { id } = req.query;
  const { nombre, email, telefono, rol, activo } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID de usuario requerido" });
  }

  // Verificar que el usuario existe
  const { data: existingUser, error } = await supabase
    .from("usuarios")
    .select("id_usuario, email")
    .eq("id_usuario", id)
    .single();

  if (error || !existingUser) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  // Si se cambia el email, verificar que no exista
  if (email && email !== existingUser.email) {
    const { data: emailExists } = await supabase
      .from("usuarios")
      .select("id_usuario")
      .eq("email", email)
      .neq("id_usuario", id)
      .single();

    if (emailExists) {
      return res.status(400).json({
        error: "Email ya registrado",
        message: "Ya existe otro usuario con este email",
      });
    }
  }

  const updates = {};
  if (nombre !== undefined) updates.nombre = nombre;
  if (email !== undefined) updates.email = email;
  if (telefono !== undefined) updates.telefono = telefono;
  if (rol !== undefined) updates.rol = rol;
  if (activo !== undefined) updates.activo = activo;
  // Campo notas_admin removido - no existe en la tabla
  // Removed ultima_visita field as it doesn't exist in the database

  updates.updated_at = new Date().toISOString();

  const { data, error: updateError } = await supabase
    .from("usuarios")
    .update(updates)
    .eq("id_usuario", id)
    .select()
    .single();

  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  res.status(200).json({
    success: true,
    data,
    message: "Usuario actualizado exitosamente",
  });
}

async function deactivateUsuario(req, res) {
  const { id } = req.query;
  const { permanente = false, motivo } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID de usuario requerido" });
  }

  // Verificar reservas activas antes de desactivar
  const { data: reservasActivas, error: reservasError } = await supabase
    .from("reservas")
    .select("id_reserva")
    .eq("id_cliente", id)
    .in("estado", ["pendiente", "confirmada", "en_progreso"]);

  if (reservasError) {
    return res.status(400).json({ error: reservasError.message });
  }

  if (reservasActivas && reservasActivas.length > 0) {
    return res.status(400).json({
      error: "Usuario tiene reservas activas",
      message:
        "No se puede desactivar un usuario con reservas pendientes o confirmadas",
      reservas_activas: reservasActivas.length,
    });
  }

  if (permanente) {
    // Eliminación permanente (soft delete)
    const { data, error: deleteError } = await supabase
      .from("usuarios")
      .update({
        activo: false,
        fecha_eliminacion: new Date().toISOString(),
        motivo_eliminacion: motivo,
        updated_at: new Date().toISOString(),
      })
      .eq("id_usuario", id)
      .select()
      .single();

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    res.status(200).json({
      success: true,
      data,
      message: "Usuario eliminado permanentemente",
    });
  } else {
    // Desactivación temporal
    const { data, error: deactivateError } = await supabase
      .from("usuarios")
      .update({
        activo: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id_usuario", id)
      .select()
      .single();

    if (deactivateError) {
      return res.status(400).json({ error: deactivateError.message });
    }

    res.status(200).json({
      success: true,
      data,
      message: "Usuario desactivado exitosamente",
    });
  }
}
