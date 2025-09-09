import { supabase } from '../lib/database.js';

console.log('🔍 CONSOLIDATED API LOADING - v2.1 (Post-fix schema):', {
  supabaseExists: !!supabase,
  timestamp: new Date().toISOString()
});

/**
 * 🚀 ULTRA-CONSOLIDATED API - Solución al límite de 12 funciones Vercel Hobby
 * 
 * Esta API maneja MÚLTIPLES endpoints en una sola función:
 * - GET /api/consolidated?type=barberos
 * - GET /api/consolidated?type=servicios  
 * - GET /api/consolidated?type=usuarios
 * - GET /api/consolidated?type=reservas
 * - GET /api/consolidated?type=bloqueos
 * - GET /api/consolidated?type=disponibilidad&action=month
 * - GET /api/consolidated?type=disponibilidad&action=check
 * - POST /api/consolidated?type=barberos (CRUD)
 * - POST /api/consolidated?type=reservas (CRUD)
 */
export default async function handler(req, res) {
  console.log('🚀 CONSOLIDATED API START:', {
    method: req.method,
    url: req.url,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return res.status(200).end();
  }

  try {
    const { type, action, ...params } = req.query;
    console.log('📋 Request params:', { type, action, params });
    console.log('📋 Full query object:', req.query);

    if (!type) {
      console.log('❌ Missing type parameter');
      return res.status(400).json({ 
        error: 'Missing required parameter: type',
        available: ['barberos', 'servicios', 'usuarios', 'reservas', 'bloqueos', 'disponibilidad', 'health']
      });
    }
    console.log(`🚀 CONSOLIDATED API: ${req.method} ${type}/${action || 'default'}`);

    // Verificar que supabase esté disponible
    if (!supabase) {
      console.error('❌ Supabase client not available');
      return res.status(500).json({ 
        error: 'Database connection not available',
        timestamp: new Date().toISOString()
      });
    }

    switch (type) {
      case 'barberos':
        return await handleBarberos(req, res, params);
        
      case 'servicios':
        return await handleServicios(req, res, params);
        
      case 'usuarios':
        return await handleUsuarios(req, res, params);
        
      case 'reservas':
        return await handleReservas(req, res, params);
        
      case 'bloqueos':
        return await handleBloqueos(req, res, params);
        
      case 'debug-barberos':
        // Debug temporal: consultar directamente tabla barberos
        const { data: debugBarberos, error: debugError } = await supabase
          .from('barberos')
          .select('*');
        if (debugError) return res.status(500).json({ error: debugError.message });
        return res.status(200).json({ data: debugBarberos });
        
      case 'disponibilidad':
        console.log('🗓️ DISPONIBILIDAD REQUEST:', { action, params });
        if (action === 'month') {
          return await handleDisponibilidadMonth(req, res, params);
        } else if (action === 'check') {
          return await handleDisponibilidadCheck(req, res, params);
        }
        console.log('❌ Invalid disponibilidad action:', action);
        return res.status(400).json({ 
          error: 'Invalid disponibilidad action',
          received: action,
          available: ['month', 'check']
        });
        
      case 'health':
        return res.status(200).json({ 
          status: 'OK', 
          timestamp: new Date().toISOString(),
          message: 'Consolidated API is running'
        });
        
      default:
        return res.status(400).json({ 
          error: 'Invalid type parameter',
          available: ['barberos', 'servicios', 'usuarios', 'reservas', 'bloqueos', 'disponibilidad', 'health']
        });
    }

  } catch (error) {
    console.error('❌ CONSOLIDATED API ERROR:', {
      error: error.message,
      stack: error.stack,
      query: req.query,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

// =====================================================
// 🔥 BARBEROS HANDLER - Corregido para usar tabla usuarios
// =====================================================
async function handleBarberos(req, res, params) {
  if (req.method === 'GET') {
    const { id } = params;
    
    if (id) {
      // Obtener barbero específico
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          id_usuario,
          nombre,
          email,
          telefono,
          rol,
          activo,
          avatar_url,
          configuracion,
          created_at,
          barberos (
            id_barbero,
            especialidades,
            horario_inicio,
            horario_fin,
            dias_trabajo,
            tiempo_descanso,
            comision_base,
            biografia,
            calificacion_promedio,
            total_cortes
          )
        `)
        .eq('id_usuario', id)
        .single();
        
      if (error) return res.status(404).json({ error: 'Barbero no encontrado' });
      return res.status(200).json({ data });
    } else {
      // Obtener todos los barberos (filtrar por activo y rol)
      const showInactive = params.includeInactive === 'true';
      let query = supabase
        .from('usuarios')
        .select(`
          id_usuario,
          nombre,
          email,
          telefono,
          rol,
          activo,
          avatar_url,
          configuracion,
          created_at,
          barberos (
            id_barbero,
            especialidades,
            horario_inicio,
            horario_fin,
            dias_trabajo,
            tiempo_descanso,
            comision_base,
            biografia,
            calificacion_promedio,
            total_cortes
          )
        `)
        .eq('rol', 'barbero');
      
      if (!showInactive) {
        query = query.eq('activo', true);
      }
      
      const { data, error } = await query.order('nombre');
      if (error) {
        console.error('Error fetching barberos:', error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ data: data || [] });
    }
  }
  
  if (req.method === 'POST') {
    console.log('🔧 POST barberos - Body received:', req.body);
    const { nombre, telefono, email, especialidades, horario_inicio, horario_fin, dias_trabajo, tiempo_descanso, activo } = req.body;
    
    // Validación básica
    if (!nombre || !email) {
      console.log('❌ Validation failed: missing nombre or email');
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }
    
    console.log('🔧 Creating user with data:', { nombre, telefono, email, rol: 'barbero', activo: activo !== false });
    
    // Crear usuario primero
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        nombre,
        telefono,
        email,
        rol: 'barbero',
        activo: activo !== false
      })
      .select()
      .single();
      
    if (usuarioError) {
      console.log('❌ Error creating user:', usuarioError);
      return res.status(400).json({ error: usuarioError.message });
    }
    
    console.log('✅ User created:', usuario);
    console.log('🔧 Creating barbero profile with data:', {
      id_usuario: usuario.id_usuario,
      especialidades: especialidades || [],
      horario_inicio: horario_inicio || '09:00',
      horario_fin: horario_fin || '18:00',
      dias_trabajo: dias_trabajo || ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
      tiempo_descanso: tiempo_descanso || 15
    });
    
    // Crear perfil de barbero
    const { data: barbero, error: barberoError } = await supabase
      .from('barberos')
      .insert({
        id_usuario: usuario.id_usuario,
        especialidades: especialidades || [],
        horario_inicio: horario_inicio || '09:00',
        horario_fin: horario_fin || '18:00',
        dias_trabajo: dias_trabajo || ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
        tiempo_descanso: tiempo_descanso || 15
      })
      .select()
      .single();
      
    if (barberoError) {
      console.log('❌ Error creating barbero profile:', barberoError);
      return res.status(400).json({ error: barberoError.message });
    }
    
    console.log('✅ Barbero profile created:', barbero);
    
    // 🔧 PATCH: Obtener el barbero completo con la estructura correcta (v2.1)
    console.log('🔍 Attempting to fetch complete barbero with id_usuario:', usuario.id_usuario);
    const { data: barberoCompleto, error: fetchError } = await supabase
      .from('usuarios')
      .select(`
        id_usuario,
        nombre,
        email,
        telefono,
        rol,
        activo,
        avatar_url,
        configuracion,
        created_at,
        barberos (
          id_barbero,
          especialidades,
          horario_inicio,
          horario_fin,
          dias_trabajo,
          tiempo_descanso,
          comision_base,
          biografia,
          calificacion_promedio,
          total_cortes
        )
      `)
      .eq('id_usuario', usuario.id_usuario)
      .single();
    
    if (fetchError) {
      console.log('❌ Error fetching created barbero:', fetchError);
      return res.status(500).json({ error: 'Error al obtener barbero creado' });
    }
    
    console.log('✅ Final barbero completo:', barberoCompleto);
    return res.status(201).json({ data: barberoCompleto });
  }
  
  if (req.method === 'PUT') {
    const { id } = params;
    const updates = req.body;
    
    // Separar updates de usuario y barbero
    const usuarioUpdates = {};
    const barberoUpdates = {};
    
    ['nombre', 'email', 'telefono', 'activo'].forEach(field => {
      if (updates[field] !== undefined) usuarioUpdates[field] = updates[field];
    });
    
    ['especialidades', 'horario_inicio', 'horario_fin', 'dias_trabajo', 'tiempo_descanso', 'biografia'].forEach(field => {
      if (updates[field] !== undefined) barberoUpdates[field] = updates[field];
    });
    
    // Actualizar usuario
    if (Object.keys(usuarioUpdates).length > 0) {
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .update(usuarioUpdates)
        .eq('id_usuario', id);
        
      if (usuarioError) return res.status(400).json({ error: usuarioError.message });
    }
    
    // Actualizar barbero
    if (Object.keys(barberoUpdates).length > 0) {
      const { error: barberoError } = await supabase
        .from('barberos')
        .update(barberoUpdates)
        .eq('id_usuario', id);
        
      if (barberoError) return res.status(400).json({ error: barberoError.message });
    }
    
    // Obtener datos actualizados
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id_usuario, nombre, email, telefono, rol, activo,
        barberos (especialidades, horario_inicio, horario_fin, dias_trabajo, tiempo_descanso)
      `)
      .eq('id_usuario', id)
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// =====================================================
// 🔥 DISPONIBILIDAD MONTH HANDLER (SIMPLIFICADO)
// =====================================================
async function handleDisponibilidadMonth(req, res, params) {
  console.log('📅 handleDisponibilidadMonth called with:', params);
  const { barberoId, serviceId, year, month } = params;

  if (!barberoId || !serviceId || !year || !month) {
    console.log('❌ Missing parameters:', { barberoId, serviceId, year, month });
    return res.status(400).json({ 
      error: 'Faltan parámetros: barberoId, serviceId, year, month' 
    });
  }

  console.log(`🚀 ULTRA-FAST Calendar: ${barberoId}-${serviceId}-${year}-${month}`);
  const startTime = Date.now();

  try {
    // STEP 1: Obtener información del barbero desde usuarios
    const { data: barbero, error: barberoError } = await supabase
      .from('usuarios')
      .select(`
        id_usuario,
        nombre,
        activo,
        barberos (
          id_barbero,
          horario_inicio,
          horario_fin,
          dias_trabajo
        )
      `)
      .eq('id_usuario', barberoId)
      .eq('rol', 'barbero')
      .eq('activo', true)
      .single();

    if (barberoError || !barbero || !barbero.barberos) {
      return res.status(404).json({ error: 'Barbero no encontrado' });
    }

    const realBarberoId = barbero.barberos.id_barbero;

    // STEP 2: Obtener información del servicio
    const { data: servicio, error: servicioError } = await supabase
      .from('servicios')
      .select('id_servicio, duracion, nombre')
      .eq('id_servicio', serviceId)
      .eq('activo', true)
      .single();

    if (servicioError || !servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // STEP 3: Calcular rango de fechas del mes
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;

    // STEP 4: Obtener reservas del mes
    const { data: reservas, error: reservasError } = await supabase
      .from('reservas')
      .select('fecha_reserva, hora_inicio, hora_fin, estado')
      .eq('id_barbero', realBarberoId)
      .gte('fecha_reserva', startDate)
      .lte('fecha_reserva', endDate)
      .in('estado', ['confirmada', 'pendiente']);

    if (reservasError) {
      console.error('Error reservas:', reservasError);
      return res.status(500).json({ error: 'Error consultando reservas' });
    }

    // STEP 5: Obtener bloqueos del mes
    const { data: bloqueos, error: bloqueosError } = await supabase
      .from('bloqueos_horarios')
      .select('fecha_inicio, fecha_fin, hora_inicio, hora_fin')
      .eq('id_barbero', realBarberoId)
      .gte('fecha_inicio', startDate)
      .lte('fecha_fin', endDate);

    if (bloqueosError) {
      console.error('Error bloqueos:', bloqueosError);
      return res.status(500).json({ error: 'Error consultando bloqueos' });
    }

    // STEP 6: Procesar datos
    const serviceDuration = servicio.duracion || 30;
    const barberoConfig = barbero.barberos || {};
    const workingDays = Array.isArray(barberoConfig.dias_trabajo) 
      ? barberoConfig.dias_trabajo 
      : JSON.parse(barberoConfig.dias_trabajo || '["lunes","martes","miercoles","jueves","viernes"]');
    
    const horaInicio = barberoConfig.horario_inicio || '09:00';
    const horaFin = barberoConfig.horario_fin || '18:00';

    // Indexar datos para búsqueda O(1)
    const reservasByDate = new Map();
    const bloqueosByDate = new Map();

    (reservas || []).forEach(reserva => {
      if (!reservasByDate.has(reserva.fecha_reserva)) {
        reservasByDate.set(reserva.fecha_reserva, []);
      }
      reservasByDate.get(reserva.fecha_reserva).push({
        inicio: reserva.hora_inicio,
        fin: reserva.hora_fin
      });
    });

    (bloqueos || []).forEach(bloqueo => {
      const startDay = new Date(bloqueo.fecha_inicio);
      const endDay = new Date(bloqueo.fecha_fin);
      
      for (let d = new Date(startDay); d <= endDay; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!bloqueosByDate.has(dateStr)) {
          bloqueosByDate.set(dateStr, []);
        }
        bloqueosByDate.get(dateStr).push({
          inicio: bloqueo.hora_inicio,
          fin: bloqueo.hora_fin
        });
      }
    });

    // STEP 7: Procesar todos los días
    const result = {
      barberoId: barberoId,
      serviceId: serviceId,
      month: parseInt(month),
      year: parseInt(year),
      availableDays: [],
      unavailableDays: [],
      totalDays: daysInMonth,
      workingDays: workingDays,
      processingTime: 0
    };

    const today = new Date();
    const daysMap = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
      'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day);
      const dateStr = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayName = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][date.getDay()];

      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isWorkingDay = workingDays.includes(dayName) || workingDays.includes(dayName.replace('é', 'e'));

      if (isPast || !isWorkingDay) {
        result.unavailableDays.push({
          day,
          date: dateStr,
          reason: isPast ? 'past' : 'not_working_day'
        });
        continue;
      }

      const dayBloqueos = bloqueosByDate.get(dateStr) || [];
      const hasFullDayBlock = dayBloqueos.some(b => 
        b.inicio === '00:00:00' && b.fin === '23:59:59'
      );

      if (hasFullDayBlock) {
        result.unavailableDays.push({ day, date: dateStr, reason: 'blocked' });
        continue;
      }

      const availableSlots = generateAvailableSlots(
        horaInicio,
        horaFin,
        serviceDuration,
        reservasByDate.get(dateStr) || [],
        dayBloqueos,
        isToday ? today.getHours() * 60 + today.getMinutes() : 0
      );

      if (availableSlots.length > 0) {
        result.availableDays.push({
          day, date: dateStr, slotsCount: availableSlots.length,
          firstSlot: availableSlots[0], lastSlot: availableSlots[availableSlots.length - 1]
        });
      } else {
        result.unavailableDays.push({ day, date: dateStr, reason: 'no_slots' });
      }
    }

    result.processingTime = Date.now() - startTime;
    console.log(`✅ ULTRA-FAST: ${result.processingTime}ms, Available: ${result.availableDays.length}/${daysInMonth}`);
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Disponibilidad Month Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// =====================================================
// 🔥 OTROS HANDLERS SIMPLIFICADOS
// =====================================================
async function handleServicios(req, res, params) {
  if (req.method === 'GET') {
    const { id } = params;
    
    if (id) {
      // Obtener servicio específico
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('id_servicio', id)
        .single();
        
      if (error) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.status(200).json({ data });
    } else {
      // Obtener todos los servicios
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .eq('activo', true)
        .order('nombre');
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: data || [] });
    }
  }
  
  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('servicios')
      .insert(req.body)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ data });
  }
  
  if (req.method === 'PUT') {
    const { id } = params;
    const { data, error } = await supabase
      .from('servicios')
      .update(req.body)
      .eq('id_servicio', id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  if (req.method === 'DELETE') {
    const { id } = params;
    const { data, error } = await supabase
      .from('servicios')
      .update({ activo: false })
      .eq('id_servicio', id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleUsuarios(req, res, params) {
  if (req.method === 'GET') {
    const { id, email } = params;
    
    if (id) {
      // Obtener usuario específico
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id_usuario', id)
        .single();
        
      if (error) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.status(200).json({ data });
    } else if (email) {
      // Buscar por email
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('activo', true);
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: data || [] });
    } else {
      // Obtener todos los usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombre');
        
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: data || [] });
    }
  }
  
  if (req.method === 'POST') {
    console.log('👤 Crear usuario:', req.body);
    
    try {
      const userData = {
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono || null,
        rol: req.body.rol || 'cliente',
        activo: req.body.activo !== false
      };
      
      const { data, error } = await supabase
        .from('usuarios')
        .insert(userData)
        .select()
        .single();
        
      if (error) {
        console.error('❌ Error creando usuario:', error);
        return res.status(400).json({ error: error.message });
      }
      
      console.log('✅ Usuario creado exitosamente:', data.id_usuario);
      return res.status(201).json({ data });
    } catch (err) {
      console.error('❌ Error en POST usuarios:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  
  if (req.method === 'PUT') {
    const { id } = params;
    const { data, error } = await supabase
      .from('usuarios')
      .update(req.body)
      .eq('id_usuario', id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleReservas(req, res, params) {
  if (req.method === 'GET') {
    const { id, barbero, fecha, estado, cliente } = params;
    
    if (id) {
      // Obtener reserva específica
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          cliente:usuarios!reservas_id_cliente_fkey(id_usuario, nombre, telefono, email),
          servicio:servicios(id_servicio, nombre, precio, duracion)
        `)
        .eq('id_reserva', id)
        .single();
        
      if (error) return res.status(404).json({ error: 'Reserva no encontrada' });
      return res.status(200).json({ data });
    } else {
      // Obtener reservas con filtros
      let query = supabase
        .from('reservas')
        .select(`
          *,
          cliente:usuarios!reservas_id_cliente_fkey(id_usuario, nombre, telefono, email),
          servicio:servicios(id_servicio, nombre, precio, duracion)
        `);
      
      if (barbero) query = query.eq('id_barbero', barbero);
      if (fecha) query = query.eq('fecha_reserva', fecha);
      if (estado) query = query.eq('estado', estado);
      if (cliente) query = query.eq('id_cliente', cliente);
      
      query = query.order('fecha_reserva', { ascending: false })
                   .order('hora_inicio', { ascending: false });
      
      const { data, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: data || [] });
    }
  }
  
  if (req.method === 'POST') {
    console.log('📝 Crear reserva:', req.body);
    
    // Validar datos requeridos (hora_fin no es requerida, se calculará automáticamente)
    const { id_cliente, id_barbero, id_servicio, fecha_reserva, hora_inicio } = req.body;
    
    if (!id_cliente || !id_barbero || !id_servicio || !fecha_reserva || !hora_inicio) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        required: ['id_cliente', 'id_barbero', 'id_servicio', 'fecha_reserva', 'hora_inicio'],
        received: { id_cliente, id_barbero, id_servicio, fecha_reserva, hora_inicio }
      });
    }
    
    try {
      // 1. Obtener datos del servicio para calcular duración y precio
      const { data: servicio, error: servicioError } = await supabase
        .from('servicios')
        .select('duracion, precio')
        .eq('id_servicio', id_servicio)
        .single();
        
      if (servicioError || !servicio) {
        console.error('❌ Error obteniendo servicio:', servicioError);
        return res.status(400).json({ error: 'Servicio no encontrado' });
      }
      
      // 2. Calcular hora_fin basada en duración del servicio
      const [horaInicio, minutosInicio] = hora_inicio.split(':').map(Number);
      const totalMinutos = horaInicio * 60 + minutosInicio + servicio.duracion;
      const horaFin = Math.floor(totalMinutos / 60);
      const minutosFin = totalMinutos % 60;
      const hora_fin = `${horaFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`;
      
      const reservaData = {
        id_cliente,
        id_barbero,
        id_servicio,
        fecha_reserva,
        hora_inicio,
        hora_fin,
        duracion_minutos: servicio.duracion, // Usar 'duracion_minutos' según el schema real de la BD
        precio_total: servicio.precio,
        estado: 'confirmada',
        notas_cliente: req.body.notas_cliente || null,
        notas_internas: req.body.notas_internas || null
      };
      
      console.log('📝 Datos de reserva procesados:', reservaData);
      console.log('🕐 Calculado automáticamente:', { hora_fin, duracion_minutos: servicio.duracion, precio_total: servicio.precio });
      
      const { data, error } = await supabase
        .from('reservas')
        .insert(reservaData)
        .select(`
          *,
          cliente:usuarios!reservas_id_cliente_fkey(id_usuario, nombre, telefono, email),
          barbero:barberos!reservas_id_barbero_fkey(id_barbero),
          servicio:servicios!reservas_id_servicio_fkey(id_servicio, nombre, precio, duracion)
        `)
        .single();
        
      if (error) {
        console.error('❌ Error creando reserva:', error);
        return res.status(400).json({ error: error.message, details: error });
      }
      
      console.log('✅ Reserva creada exitosamente:', data.id_reserva);
      return res.status(201).json({ data });
    } catch (err) {
      console.error('❌ Error en POST reservas:', err);
      return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
  }
  
  if (req.method === 'PUT') {
    const { id } = params;
    const { data, error } = await supabase
      .from('reservas')
      .update(req.body)
      .eq('id_reserva', id)
      .select()
      .single();
      
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleBloqueos(req, res, params) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('bloqueos_horarios')
      .select('*')
      .order('fecha_inicio');
      
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data: data || [] });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleDisponibilidadCheck(req, res, params) {
  // Implementación simplificada para check individual
  return res.status(200).json({ available: true, slots: [] });
}

// =====================================================
// 🔥 HELPER FUNCTION
// =====================================================
function generateAvailableSlots(horaInicio, horaFin, duration, reservas, bloqueos, minCurrentTime) {
  const slots = [];
  
  const [startHour, startMin] = horaInicio.split(':').map(Number);
  const [endHour, endMin] = horaFin.split(':').map(Number);
  
  const dayStart = startHour * 60 + startMin;
  const dayEnd = endHour * 60 + endMin;
  
  const occupied = new Array(24 * 60).fill(false);
  
  // Marcar reservas
  reservas.forEach(reserva => {
    // Validar que los campos de hora no sean null/undefined
    if (!reserva.inicio || !reserva.fin) {
      console.warn('⚠️ Reserva con horas inválidas:', reserva);
      return;
    }
    
    const [rStartH, rStartM] = reserva.inicio.split(':').map(Number);
    const [rEndH, rEndM] = reserva.fin.split(':').map(Number);
    
    for (let m = rStartH * 60 + rStartM; m < rEndH * 60 + rEndM; m++) {
      occupied[m] = true;
    }
  });
  
  // Marcar bloqueos
  bloqueos.forEach(bloqueo => {
    // Validar que los campos de hora no sean null/undefined
    if (!bloqueo.inicio || !bloqueo.fin) {
      // Si no hay horas específicas, bloquear todo el día
      for (let m = 0; m < 24 * 60; m++) {
        occupied[m] = true;
      }
      return;
    }
    
    const [bStartH, bStartM] = bloqueo.inicio.split(':').map(Number);
    const [bEndH, bEndM] = bloqueo.fin.split(':').map(Number);
    
    for (let m = bStartH * 60 + bStartM; m < bEndH * 60 + bEndM; m++) {
      occupied[m] = true;
    }
  });
  
  // Generar slots
  for (let start = Math.max(dayStart, minCurrentTime + 120); start + duration <= dayEnd; start += 15) {
    let canBook = true;
    
    for (let m = start; m < start + duration; m++) {
      if (occupied[m]) {
        canBook = false;
        break;
      }
    }
    
    if (canBook) {
      const hour = Math.floor(start / 60);
      const min = start % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
    }
  }
  
  return slots;
}
