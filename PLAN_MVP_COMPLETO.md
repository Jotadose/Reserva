# 📋 PLAN DE IMPLEMENTACIÓN MVP - SISTEMA DE RESERVAS

## 🎯 Estado Actual vs Objetivo MVP

### ✅ FUNCIONALIDADES EXISTENTES

- ✅ Frontend React + Vite + Tailwind CSS
- ✅ Sistema básico de reservas con Supabase
- ✅ Landing page y flujo de reservas
- ✅ Panel administrativo simple
- ✅ Componentes: BookingCalendar, ServiceSelection, ClientForm
- ✅ Hooks: useBookingsSimple, useAvailabilitySimple

### 🔧 IMPLEMENTACIONES NECESARIAS PARA MVP

## 1. 👥 SISTEMA DE USUARIOS Y ROLES

### Tabla de Usuarios

```sql
CREATE TABLE usuarios (
  id_usuario UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) CHECK (rol IN ('cliente', 'barbero', 'admin')) DEFAULT 'cliente',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla de Barberos (extiende usuarios)

```sql
CREATE TABLE barberos (
  id_barbero UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_usuario UUID REFERENCES usuarios(id_usuario),
  especialidades TEXT[],
  horario_base JSONB DEFAULT '{"lunes": {"inicio": "09:00", "fin": "18:00"}, "martes": {"inicio": "09:00", "fin": "18:00"}}',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. 🛠️ SERVICIOS ESTRUCTURADOS

### Tabla de Servicios

```sql
CREATE TABLE servicios (
  id_servicio UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  duracion INTEGER NOT NULL, -- en minutos
  descripcion TEXT,
  precio DECIMAL(10,2),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 3. 📅 SISTEMA DE DISPONIBILIDAD AVANZADO

### Tabla de Disponibilidad

```sql
CREATE TABLE disponibilidad (
  id_disponibilidad UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_barbero UUID REFERENCES barberos(id_barbero),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  tipo VARCHAR(20) CHECK (tipo IN ('trabajo', 'descanso', 'vacaciones', 'almuerzo')) NOT NULL,
  estado VARCHAR(20) CHECK (estado IN ('activo', 'inactivo')) DEFAULT 'activo',
  recurring BOOLEAN DEFAULT false,
  dias_semana INTEGER[] DEFAULT NULL, -- 1=lunes, 7=domingo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Evitar solapamientos
  CONSTRAINT no_overlap_disponibilidad
    EXCLUDE USING gist (
      id_barbero WITH =,
      daterange(fecha_inicio, fecha_fin, '[]') WITH &&,
      timerange(hora_inicio, hora_fin, '[]') WITH &&
    ) WHERE (estado = 'activo')
);
```

## 4. 🎫 RESERVAS MEJORADAS

### Actualización tabla de Reservas

```sql
CREATE TABLE reservas (
  id_reserva UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_cliente UUID REFERENCES usuarios(id_usuario),
  id_servicio UUID REFERENCES servicios(id_servicio),
  id_barbero UUID REFERENCES barberos(id_barbero),
  fecha_reserva DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado_reserva VARCHAR(20) CHECK (estado_reserva IN ('pendiente', 'confirmada', 'en_progreso', 'completada', 'cancelada')) DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Evitar reservas solapadas para el mismo barbero
  CONSTRAINT no_overlap_reservas
    EXCLUDE USING gist (
      id_barbero WITH =,
      daterange(fecha_reserva, fecha_reserva, '[]') WITH &&,
      timerange(hora_inicio, hora_fin, '[]') WITH &&
    ) WHERE (estado_reserva IN ('confirmada', 'en_progreso'))
);
```

## 5. 🔧 COMPONENTES FRONTEND NUEVOS

### A. Sistema de Autenticación

- `components/auth/LoginForm.tsx`
- `components/auth/RoleGuard.tsx`
- `hooks/useAuth.ts`

### B. Panel de Barberos

- `components/barbero/BarberoDashboard.tsx`
- `components/barbero/DisponibilidadManager.tsx`
- `components/barbero/MisReservas.tsx`

### C. Panel de Admin Avanzado

- `components/admin/BarberosManager.tsx`
- `components/admin/ServiciosManager.tsx`
- `components/admin/DisponibilidadGlobal.tsx`
- `components/admin/ReportesBasicos.tsx`

### D. Selección de Barbero

- `components/booking/BarberoSelection.tsx`
- Actualizar `BookingCalendar.tsx` para filtrar por barbero

## 6. 🔌 API ENDPOINTS NECESARIOS

### Autenticación

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Barberos

- `GET /api/barberos` - Listar barberos activos
- `GET /api/barberos/:id/disponibilidad` - Disponibilidad específica
- `POST /api/barberos/:id/disponibilidad` - Crear bloque de disponibilidad
- `PUT /api/barberos/:id/disponibilidad/:idDisp` - Actualizar disponibilidad

### Servicios

- `GET /api/servicios` - Listar servicios activos
- `POST /api/servicios` - Crear servicio (admin)
- `PUT /api/servicios/:id` - Actualizar servicio

### Reservas Avanzadas

- `GET /api/reservas/barbero/:id` - Reservas de un barbero
- `POST /api/reservas/validar` - Validar disponibilidad antes de crear
- `PUT /api/reservas/:id/estado` - Cambiar estado de reserva

### Disponibilidad Inteligente

- `GET /api/disponibilidad/:barberoId/:fecha` - Slots disponibles para barbero/fecha
- `POST /api/disponibilidad/bulk` - Crear disponibilidad recurrente

## 7. 🎯 FLUJOS DE USUARIO IMPLEMENTADOS

### Cliente:

1. **Landing** → **Servicio** → **Barbero** → **Fecha/Hora** → **Datos** → **Confirmación**
2. API valida disponibilidad real en cada paso
3. No se expone información de barberos no disponibles

### Barbero:

1. **Login** → **Dashboard** con mis reservas de hoy
2. **Gestionar Disponibilidad**: Crear descansos, vacaciones, cambiar horarios
3. **Ver mis Reservas**: Filtradas por fecha, estado
4. **Actualizar Estado**: Marcar como completada, en progreso, etc.

### Admin:

1. **Dashboard Global**: Todas las reservas, estadísticas por barbero
2. **Gestión de Barberos**: Activar/desactivar, horarios base
3. **Gestión de Servicios**: Precios, duraciones, disponibilidad
4. **Disponibilidad Global**: Ver calendarios de todos los barberos
5. **Reportes Básicos**: Reservas por período, barbero más solicitado, etc.

## 8. 🔐 VALIDACIONES Y REGLAS DE NEGOCIO

### API Middleware:

- Validación de roles en cada endpoint
- Verificación de disponibilidad en tiempo real
- Prevención de reservas solapadas
- Validación de horarios laborales

### Frontend Guards:

- Rutas protegidas por rol
- Componentes condicionales según permisos
- Validación de formularios antes de envío

## 9. 📱 PRIORIZACIÓN DE DESARROLLO (4 semanas)

### Semana 1: Base de Datos y Auth

- ✅ Migrar esquema completo
- ✅ Sistema de autenticación básico
- ✅ Seeders con datos de prueba (4 barberos, servicios)

### Semana 2: Disponibilidad y API

- ✅ Endpoints de disponibilidad
- ✅ Lógica de validación de reservas
- ✅ Panel de barbero básico

### Semana 3: Frontend Avanzado

- ✅ Selección de barbero en reservas
- ✅ Dashboard de barbero funcional
- ✅ Panel de admin mejorado

### Semana 4: Pulimiento y Testing

- ✅ Validaciones completas
- ✅ Testing de flujos críticos
- ✅ Deploy y configuración de producción

## 10. 🚀 TECNOLOGÍAS Y HERRAMIENTAS

### Mantenidas:

- Frontend: React + Vite + Tailwind CSS
- Base de datos: Supabase/PostgreSQL
- Deploy: Vercel (Frontend)

### Nuevas integraciones:

- Autenticación: Supabase Auth o JWT custom
- Estado global: Zustand o Context API
- Validaciones: Zod para formularios
- Testing: Vitest + React Testing Library

## 11. 📊 MÉTRICAS DE ÉXITO MVP

### Funcionalidad:

- ✅ 4 barberos pueden gestionar su disponibilidad independientemente
- ✅ Clientes ven solo horarios realmente disponibles
- ✅ 0% reservas solapadas o en horarios de descanso
- ✅ Admin puede crear/modificar disponibilidad global

### Performance:

- ✅ Carga inicial < 3 segundos
- ✅ Búsqueda de disponibilidad < 500ms
- ✅ Creación de reserva < 1 segundo

### UX:

- ✅ Flujo completo de reserva en < 2 minutos
- ✅ Barberos actualizan disponibilidad en < 30 segundos
- ✅ Admin accede a reportes básicos < 5 clicks

---

¿Te gustaría que comencemos implementando alguna parte específica de este plan? Recomiendo empezar por la migración del esquema de base de datos para tener la foundation sólida.
