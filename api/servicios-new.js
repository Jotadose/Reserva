/**
 * ===================================================================
 * API INTERMEDIA - GESTIÓN DE SERVICIOS (NUEVO)
 * ===================================================================
 * 
 * API intermedia para gestión de servicios - versión corregida
 * Arquitectura: FRONT → API INTERMEDIA → DB SUPABASE
 */

import { supabase } from "../lib/database.js";

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getServicios(req, res);
      case 'POST':
        return await createServicio(req, res);
      case 'PUT':
        return await updateServicio(req, res);
      case 'DELETE':
        return await deleteServicio(req, res);
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

async function getServicios(req, res) {
  const { activo, categoria } = req.query;
  
  let query = supabase
    .from('servicios')
    .select('*')
    .order('categoria', { ascending: true })
    .order('nombre', { ascending: true });

  if (activo !== undefined) {
    query = query.eq('activo', activo === 'true');
  }

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data: data || [],
    count: data?.length || 0
  });
}

async function createServicio(req, res) {
  const { 
    nombre, 
    descripcion, 
    precio, 
    duracion, 
    categoria, 
    color 
  } = req.body;

  // Validación básica
  if (!nombre || !precio || !duracion) {
    return res.status(400).json({
      error: 'Faltan campos requeridos',
      required: ['nombre', 'precio', 'duracion']
    });
  }

  if (precio < 0 || duracion <= 0) {
    return res.status(400).json({
      error: 'Valores inválidos',
      message: 'El precio debe ser >= 0 y la duración > 0'
    });
  }

  const { data, error } = await supabase
    .from('servicios')
    .insert({
      nombre,
      descripcion,
      precio: parseInt(precio),
      duracion: parseInt(duracion),
      categoria,
      color: color || '#3B82F6',
      activo: true
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    success: true,
    data: data
  });
}

async function updateServicio(req, res) {
  const { id } = req.query;
  const { 
    nombre, 
    descripcion, 
    precio, 
    duracion, 
    categoria, 
    color,
    activo
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID de servicio requerido' });
  }

  const updateData = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (precio !== undefined) updateData.precio = parseInt(precio);
  if (duracion !== undefined) updateData.duracion = parseInt(duracion);
  if (categoria !== undefined) updateData.categoria = categoria;
  if (color !== undefined) updateData.color = color;
  if (activo !== undefined) updateData.activo = activo;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No hay datos para actualizar' });
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('servicios')
    .update(updateData)
    .eq('id_servicio', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data: data
  });
}

async function deleteServicio(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de servicio requerido' });
  }

  // Soft delete - marcar como inactivo
  const { data, error } = await supabase
    .from('servicios')
    .update({ 
      activo: false,
      updated_at: new Date().toISOString()
    })
    .eq('id_servicio', id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({
    success: true,
    data: data
  });
}
