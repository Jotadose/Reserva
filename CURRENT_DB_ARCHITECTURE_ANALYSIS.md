# 📊 ANÁLISIS DE ARQUITECTURA DE BASE DE DATOS ACTUAL

## 🏗️ **ESTRUCTURA ACTUAL DE TABLAS**

### 1. **TENANTS** (Barberías/Negocios)
```sql
- id (uuid, PK)
- slug (text, UNIQUE) ← URL del negocio
- name, description, category
- address, contact_phone, contact_email
- website, instagram, whatsapp
- working_hours (jsonb)
- owner_id (uuid → auth.users) ← Owner del SaaS
- subscription_status, subscription_plan
- slot_duration_minutes, settings (jsonb)
- created_at, updated_at
```

### 2. **USERS** (Usuarios del sistema)
```sql
- id (uuid, PK)
- tenant_id (uuid → tenants)
- auth_user_id (uuid → auth.users)
- name, email, phone
- role ('owner', 'admin', 'barber', 'client')
- is_active, settings (jsonb)
- created_at, updated_at
```

### 3. **PROVIDERS** (Barberos/Proveedores)
```sql
- id (uuid, PK)
- tenant_id (uuid → tenants)
- user_id (uuid → auth.users) ← ⚠️ INCONSISTENCIA
- bio, specialties (text[])
- commission_rate, role
- is_active
- created_at, updated_at
```

### 4. **SERVICES** (Servicios)
```sql
- id (uuid, PK)
- tenant_id (uuid → tenants)
- name, description
- duration_minutes, price (cents)
- category, is_active
- created_at, updated_at
```

### 5. **BOOKINGS** (Reservas)
```sql
- id (uuid, PK)
- tenant_id (uuid → tenants)
- provider_id (uuid → providers)
- service_id (uuid → services)
- client_name, client_email, client_phone
- scheduled_date, scheduled_time
- duration_minutes, total_price
- status, notes, cancellation_reason
- created_at, updated_at
```

### 6. **AVAILABILITY_BLOCKS** (Disponibilidad)
```sql
- id (uuid, PK)
- tenant_id (uuid → tenants)
- provider_id (uuid → providers)
- start_datetime, end_datetime
- is_available, notes
- created_at, updated_at
```

### 7. **NOTIFICATIONS** (Notificaciones)
```sql
- id (uuid, PK)
- tenant_id (uuid → tenants)
- booking_id (uuid → bookings)
- user_id (uuid → auth.users)
- channel, message, status
- external_id, error_message
- created_at, updated_at
```

### 8. **AUDIT_LOG** (Auditoría)
```sql
- id (uuid, PK)
- tenant_id (uuid → tenants)
- user_id (uuid → auth.users)
- entity_type, entity_id, action
- old_values, new_values (jsonb)
- ip_address, user_agent
- created_at
```

## ⚠️ **INCONSISTENCIAS DETECTADAS**

### 🔴 **Problema Principal: Referencias a `auth.users` vs `users`**

1. **PROVIDERS.user_id**:
   - En el schema: `user_id (uuid → auth.users)`
   - En producción: `user_id (uuid → users)`
   - **Conflicto**: No sabemos cuál es la realidad

2. **USERS.auth_user_id**:
   - Existe tabla `users` con referencia a `auth.users`
   - Pero `providers` apunta directamente a `auth.users`
   - **¿Cuál es el patrón correcto?**

### 🔴 **Problemas de Consistencia**

1. **Duplicación de campos `role`**:
   - `users.role` ('owner', 'admin', 'barber', 'client')
   - `providers.role` ('owner', 'admin', 'barber')
   - **¿Cuál es la fuente de verdad?**

2. **Información de cliente duplicada**:
   - `bookings` tiene datos del cliente directamente
   - `users` puede tener clientes con role='client'
   - **¿Los clientes van en `users` o solo en `bookings`?**

## 🎯 **PREGUNTAS PARA ALINEACIÓN**

### **Arquitectura de Usuarios:**
1. ¿Todos los usuarios (owners, admins, barberos, clientes) van en la tabla `users`?
2. ¿O solo los usuarios autenticados van en `users` y los clientes quedan en `bookings`?
3. ¿`providers` debería referenciar `users.id` o `auth.users.id`?

### **Roles y Permisos:**
1. ¿El campo `role` principal está en `users` o `providers`?
2. ¿Un usuario puede ser provider en múltiples tenants?
3. ¿Cómo manejamos los permisos multi-tenant?

### **Modelo de Clientes:**
1. ¿Los clientes se registran en el sistema (tabla `users`)?
2. ¿O solo proporcionan datos en el booking (campo directo)?
3. ¿Cómo manejamos clientes recurrentes?

### **Disponibilidad:**
1. ¿Usamos `availability_blocks` o horarios por defecto?
2. ¿Cómo se integra con las reservas?

## 📋 **ESTRUCTURA REAL EN PRODUCCIÓN**

Según tu mensaje anterior, la tabla `providers` real es:
```sql
create table public.providers (
  id uuid not null default extensions.uuid_generate_v4 (),
  tenant_id uuid not null,
  user_id uuid not null, ← ¿Qué tabla referencia?
  bio text null,
  specialties text[] null,
  commission_rate numeric null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
)
```

**⚠️ Falta el campo `role` que está en el schema SQL**

## 🚀 **PRÓXIMOS PASOS**

1. **Diseña tus diagramas** de la arquitectura que visualizas
2. **Yo cuestionaré** cada decisión y propondré alternativas
3. **Alinearemos** con la estructura actual de Supabase
4. **Crearemos migración** para consistencia total