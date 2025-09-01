# 🎯 PLAN FASE 2: ACTUALIZAR API Y FRONTEND PARA MVP

## ✅ COMPLETADO:

- Migración de base de datos exitosa
- Esquema MVP implementado con usuarios, barberos, servicios, disponibilidad, reservas
- Datos de prueba cargados

## 🚀 FASE 2: ACTUALIZAR SISTEMA PARA USAR NUEVO ESQUEMA

### 📋 PASO 1: Crear Nuevos Hooks de Supabase (30 min)

#### 1.1 Hook para Usuarios y Roles

```typescript
// src/hooks/useUsuarios.ts
- Gestión de usuarios con roles (cliente, barbero, admin)
- Autenticación simple por rol
- CRUD usuarios
```

#### 1.2 Hook para Barberos

```typescript
// src/hooks/useBarberos.ts
- Listar barberos activos
- Obtener información del barbero (especialidades, horarios)
- Gestión de disponibilidad
```

#### 1.3 Hook para Servicios

```typescript
// src/hooks/useServicios.ts
- Listar servicios por categoría
- Precios y duraciones actualizadas
- Filtrar servicios activos
```

#### 1.4 Hook para Reservas MVP

```typescript
// src/hooks/useReservasMVP.ts
- CRUD completo de reservas con nuevo esquema
- Validación de disponibilidad por barbero
- Estados de reserva (pendiente, confirmada, etc.)
```

#### 1.5 Hook para Disponibilidad

```typescript
// src/hooks/useDisponibilidad.ts
- Consultar slots disponibles por barbero
- Gestionar bloques de descanso/vacaciones
- Usar función obtener_slots_disponibles()
```

### 📋 PASO 2: Actualizar API Endpoints (30 min)

#### 2.1 Endpoint Usuarios

```typescript
// api/usuarios.ts
GET / api / usuarios; // Listar usuarios (solo admin)
POST / api / usuarios; // Crear usuario
GET / api / usuarios / [id]; // Obtener usuario
PATCH / api / usuarios / [id]; // Actualizar usuario
DELETE / api / usuarios / [id]; // Eliminar usuario
```

#### 2.2 Endpoint Barberos

```typescript
// api/barberos.ts
GET / api / barberos; // Listar barberos activos
GET / api / barberos / [id]; // Obtener barbero específico
PATCH / api / barberos / [id]; // Actualizar información barbero
```

#### 2.3 Endpoint Servicios

```typescript
// api/servicios.ts
GET / api / servicios; // Listar servicios activos
POST / api / servicios; // Crear servicio (admin)
PATCH / api / servicios / [id]; // Actualizar servicio (admin)
DELETE / api / servicios / [id]; // Eliminar servicio (admin)
```

#### 2.4 Endpoint Disponibilidad

```typescript
// api/disponibilidad.ts
GET    /api/disponibilidad/:barbero/:fecha    // Slots disponibles
POST   /api/disponibilidad                    // Crear bloque no disponible
DELETE /api/disponibilidad/[id]               // Eliminar bloque
```

#### 2.5 Actualizar Endpoint Reservas

```typescript
// api/reservas.ts (reemplaza bookings)
GET / api / reservas; // Listar reservas (con filtros)
POST / api / reservas; // Crear reserva (nuevo esquema)
GET / api / reservas / [id]; // Obtener reserva específica
PATCH / api / reservas / [id]; // Actualizar reserva
DELETE / api / reservas / [id]; // Cancelar reserva
```

### 📋 PASO 3: Actualizar Componentes Frontend (45 min)

#### 3.1 Actualizar BookingCalendar

```typescript
// src/components/booking/BookingCalendar.tsx
- Mostrar disponibilidad por barbero seleccionado
- Usar useDisponibilidad hook
- Filtrar slots reales (no solo horario base)
```

#### 3.2 Crear BarberoSelection

```typescript
// src/components/booking/BarberoSelection.tsx
- Selector de barbero antes de fecha/hora
- Mostrar especialidades de cada barbero
- Filtrar por servicio seleccionado
```

#### 3.3 Actualizar ServiceSelection

```typescript
// src/components/booking/ServiceSelection.tsx
- Usar datos de tabla servicios
- Mostrar precios reales en centavos/100
- Categorías y colores
```

#### 3.4 Actualizar AdminPanel

```typescript
// src/components/admin/AdminPanelMVP.tsx
- Vista de reservas por barbero
- Gestión de usuarios y roles
- Estadísticas del negocio
```

#### 3.5 Crear Panel de Barbero

```typescript
// src/components/barbero/BarberoDashboard.tsx
- Vista de mis reservas del día
- Gestionar disponibilidad (descansos, vacaciones)
- Ver estadísticas personales
```

### 📋 PASO 4: Flujo de Reservas Actualizado (30 min)

#### 4.1 Nuevo Flujo Completo

```
1. Seleccionar Servicio (tabla servicios)
2. Seleccionar Barbero (filtrado por especialidades)
3. Seleccionar Fecha y Hora (disponibilidad real)
4. Llenar Datos del Cliente (tabla usuarios)
5. Confirmar Reserva (tabla reservas)
```

#### 4.2 Validaciones Mejoradas

```typescript
- Verificar que barbero está activo
- Validar disponibilidad en tiempo real
- Evitar solapamientos automáticamente
- Respetar bloques de descanso/vacaciones
```

## ⏱️ CRONOGRAMA

### Ahora (30 min):

- ✅ Crear hooks básicos (useUsuarios, useBarberos, useServicios)
- ✅ Probar conexión con nuevas tablas

### Siguiente (30 min):

- ✅ Actualizar componentes principales
- ✅ Crear BarberoSelection

### Después (30 min):

- ✅ Implementar panel de barbero
- ✅ Testing completo del flujo

## 🎯 CRITERIOS DE ÉXITO

### Funcionales:

- ✅ Cliente puede reservar con barbero específico
- ✅ Barbero ve solo sus reservas
- ✅ Admin gestiona todo el sistema
- ✅ No se permiten solapamientos

### Técnicos:

- ✅ Todos los hooks usan nuevas tablas
- ✅ API valida roles correctamente
- ✅ Frontend muestra datos reales
- ✅ Sin referencias a tablas antigas

---

**¿Empezamos con el PASO 1: Crear los nuevos hooks de Supabase?**
