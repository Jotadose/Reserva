# 🚀 PLAN DE IMPLEMENTACIÓN MVP - SISTEMA DE RESERVAS

## 🎯 OBJETIVO: MVP robusto para 4 barberos con gestión completa de disponibilidad

### 📊 ESTADO ACTUAL (Lo que funciona)

- ✅ API Express: `/api/bookings`, `/api/availability`
- ✅ Frontend básico: reservas simples funcionando
- ✅ Base de datos: tabla `bookings` con constraintes
- ✅ Esquema completo diseñado en `database/supabase-schema-normalized.sql`

### 🔧 FASE 1: MIGRACIÓN DE BASE DE DATOS (30 min)

#### 1.1 Aplicar Esquema Completo

```sql
-- Ejecutar en orden:
1. database/supabase-schema-normalized.sql (usuarios, servicios, barberos, disponibilidad)
2. Migración de datos existentes de bookings → nueva estructura
3. Seeders con 4 barberos de prueba
```

#### 1.2 Actualizar API para Nuevas Tablas

```typescript
// Nuevos endpoints necesarios:
GET  /api/barberos              // Listar barberos activos
GET  /api/servicios             // Listar servicios
GET  /api/disponibilidad/:barbero/:fecha  // Slots disponibles por barbero
POST /api/auth/login            // Autenticación básica
```

### 🔧 FASE 2: SISTEMA DE ROLES Y AUTENTICACIÓN (45 min)

#### 2.1 Backend: Autenticación Simple

```typescript
// api/auth.ts
- JWT simple con roles (cliente, barbero, admin)
- Middleware de validación de roles
- Sessions básicas
```

#### 2.2 Frontend: Sistema de Login

```typescript
// src/hooks/useAuth.ts
- Login/logout
- Guardar rol en localStorage
- Rutas protegidas por rol
```

### 🔧 FASE 3: GESTIÓN DE BARBEROS Y DISPONIBILIDAD (60 min)

#### 3.1 API de Disponibilidad Avanzada

```typescript
// api/disponibilidad.ts
- POST /api/disponibilidad (crear bloque: trabajo, descanso, vacaciones)
- GET  /api/disponibilidad/:barbero (horarios de un barbero)
- PUT  /api/disponibilidad/:id (modificar disponibilidad)
```

#### 3.2 Frontend: Panel de Barbero

```typescript
// src/components/barbero/
- BarberoDashboard.tsx
- DisponibilidadManager.tsx (crear descansos, vacaciones)
- MisReservas.tsx
```

### 🔧 FASE 4: RESERVAS AVANZADAS CON BARBEROS (45 min)

#### 4.1 Actualizar Flujo de Reservas

```typescript
// src/components/booking/
- BarberoSelection.tsx (elegir barbero antes de fecha/hora)
- Actualizar BookingCalendar.tsx (filtrar por barbero seleccionado)
- Validación de disponibilidad real (excluir descansos/vacaciones)
```

#### 4.2 API de Reservas Mejorada

```typescript
// Actualizar api/bookings
- Validar que barbero esté disponible
- Verificar no hay descansos/vacaciones
- Relacionar reserva con barbero específico
```

### 🔧 FASE 5: PANEL DE ADMINISTRACIÓN COMPLETO (30 min)

#### 5.1 Dashboard Administrativo

```typescript
// src/components/admin/
- AdminDashboard.tsx (vista global de reservas)
- BarberosManager.tsx (activar/desactivar barberos)
- ServiciosManager.tsx (gestionar servicios y precios)
- DisponibilidadGlobal.tsx (ver calendarios de todos)
```

### 🔧 FASE 6: VALIDACIONES Y REGLAS DE NEGOCIO (30 min)

#### 6.1 Validaciones Estrictas

```typescript
// Backend: api/middleware/validation.ts
- No reservas en bloques de descanso
- No reservas en vacaciones
- No solapamientos de horarios
- Validación de roles para cada endpoint
```

#### 6.2 Frontend: UX Mejorada

```typescript
// Mostrar solo barberos disponibles
// Horarios filtrados por disponibilidad real
// Mensajes de error claros
// Estados de loading apropiados
```

## 📋 ESTRUCTURA DE ARCHIVOS FINAL

```
api/
├── auth.ts                 # Autenticación JWT
├── barberos.ts             # CRUD barberos
├── servicios.ts            # CRUD servicios
├── disponibilidad.ts       # Gestión disponibilidad
├── bookings/ (existente)   # Reservas mejoradas
└── middleware/
    └── auth.ts             # Validación roles

src/
├── hooks/
│   ├── useAuth.ts          # Autenticación
│   ├── useBarberos.ts      # Gestión barberos
│   └── useDisponibilidad.ts # Disponibilidad
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── barbero/
│   │   ├── BarberoDashboard.tsx
│   │   ├── DisponibilidadManager.tsx
│   │   └── MisReservas.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── BarberosManager.tsx
│   │   └── ServiciosManager.tsx
│   └── booking/ (mejorado)
│       ├── BarberoSelection.tsx
│       └── BookingCalendar.tsx (actualizado)

database/
├── migration-to-mvp.sql    # Migración desde estado actual
├── seeders.sql             # Datos de prueba (4 barberos)
└── mvp-schema.sql          # Esquema final MVP
```

## ⏱️ CRONOGRAMA DE IMPLEMENTACIÓN

### Día 1 (2-3 horas):

- ✅ Fase 1: Migración BD + Seeders
- ✅ Fase 2: Autenticación básica

### Día 2 (2-3 horas):

- ✅ Fase 3: Gestión barberos y disponibilidad
- ✅ Fase 4: Reservas con barberos

### Día 3 (1-2 horas):

- ✅ Fase 5: Panel admin completo
- ✅ Fase 6: Validaciones y UX
- ✅ Testing y deploy

## 🎯 CRITERIOS DE ÉXITO MVP

### Funcionales:

- ✅ 4 barberos gestionan disponibilidad independientemente
- ✅ Cliente ve solo horarios realmente disponibles
- ✅ 0% reservas en descansos/vacaciones
- ✅ Admin controla todo desde panel central

### Técnicos:

- ✅ API valida roles y permisos
- ✅ BD nunca expuesta al cliente
- ✅ Constraintes previenen solapamientos
- ✅ Sistema escalable a más barberos

---

¿Quieres empezar con la **Fase 1: Migración de Base de Datos**? Es la base para todo lo demás.
