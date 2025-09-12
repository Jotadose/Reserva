# 🔥 Barbería Yerko - Plan Individual

## 📋 Resumen del Proyecto

Este documento describe la implementación completa del **Plan Individual** personalizado para **Yerko**, transformando el sistema multi-barbero en una solución específica para un barbero independiente.

## 🎯 Características Implementadas

### ✅ Autenticación Segura
- **Supabase Auth** integrado para autenticación profesional
- Login personalizado con branding de Barbería Yerko
- Protección de rutas administrativas
- Sesiones seguras con expiración automática

### ✅ Sistema de Reservas Simplificado
- **Eliminación de selección de barbero** (Yerko es el único barbero)
- Flujo de reserva optimizado en 4 pasos:
  1. Selección de servicio
  2. Fecha y hora
  3. Datos del cliente
  4. Confirmación
- Integración con servicios específicos de Yerko

### ✅ Servicios Personalizados
Todos los servicios de Yerko configurados con precios y duraciones exactas:

#### Servicios Básicos
- **Corte de Pelo**: $12.000 (40 min) - ⭐ Alta prioridad
- **Barba con toalla vapor**: $10.000 (25 min)
- **Corte + Barba (Promoción)**: $18.000 (60 min) - ⭐ Alta prioridad
- **Línea de Diseño + Corte**: $14.000 (45 min)
- **Cejas + Corte**: $13.000 (45 min) - ⭐ Alta prioridad

#### Servicios Premium
- **Rulos Permanentes**: $55.000 (2 horas)

#### Servicios de Coloración
- **Color Fantasía**: $40.000 (3 horas)
- **Color Permanente Blanco/Grises**: $60.000 (4 horas)
- **Visos Fantasía**: $40.000 (3 horas)
- **Visos Blanco/Grises**: $60.000 (6 horas)

### ✅ Horarios Configurados
- **Horario General**: 11:00 AM - 8:00 PM
- **Almuerzo**: 2:00 PM - 3:00 PM
- **Días**: Lunes a Sábado (domingos alternos)
- **Turnos**: 11:00, 11:45, 12:30, 13:15, 15:00, 15:45, 16:30, 17:15, 18:00, 18:45, 19:30

### ✅ Períodos de Cierre
- **Vacaciones**: 21-28 Septiembre 2024
- **Competencia**: 10-14 Octubre 2024
- **Política**: 90 días de anticipación máxima

### ✅ Panel de Administración Personalizado
- Dashboard con métricas específicas para un barbero
- Gestión de reservas sin selección de barbero
- Configuración completa de servicios
- Gestión de horarios y disponibilidad
- Configuración de períodos de vacaciones

### ✅ Branding Personalizado
- **Nombre**: Barbería Yerko
- **Instagram**: @yerkobarber
- **Colores**: Gradientes púrpura y azul
- **Diseño**: Moderno con efectos glassmorphism

## 🚀 Configuración e Instalación

### 1. Variables de Entorno

Crea un archivo `.env` en `apps/web/` con la siguiente configuración:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_URL=http://localhost:3001/api

# Environment
VITE_NODE_ENV=development

# Yerko's Business Configuration
VITE_BUSINESS_NAME="Barbería Yerko"
VITE_BUSINESS_EMAIL="yerko@barberia.com"
VITE_BUSINESS_PHONE="+56 9 XXXX XXXX"
VITE_BUSINESS_INSTAGRAM="@yerkobarber"
VITE_BUSINESS_ADDRESS="Dirección de la barbería"

# App Configuration
VITE_APP_MODE="individual"
VITE_BARBER_NAME="Yerko"
VITE_BARBER_ID="yerko-barber-id"

# Working Hours
VITE_WORKING_HOURS_START="11:00"
VITE_WORKING_HOURS_END="20:00"
VITE_LUNCH_START="14:00"
VITE_LUNCH_END="15:00"
```

### 2. Configuración de Supabase

#### Crear Usuario Admin
```sql
-- En Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'yerko@barberia.com',
  crypt('tu_password_seguro', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

#### Tabla de Configuración
```sql
-- Tabla para configuraciones de Yerko
CREATE TABLE yerko_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO yerko_config (config_key, config_value) VALUES
('working_hours', '{
  "monday": {"start": "11:00", "end": "20:00", "enabled": true},
  "tuesday": {"start": "11:00", "end": "20:00", "enabled": true},
  "wednesday": {"start": "11:00", "end": "20:00", "enabled": true},
  "thursday": {"start": "11:00", "end": "20:00", "enabled": true},
  "friday": {"start": "11:00", "end": "20:00", "enabled": true},
  "saturday": {"start": "11:00", "end": "20:00", "enabled": true},
  "sunday": {"start": "11:00", "end": "20:00", "enabled": false}
}'),
('business_info', '{
  "name": "Barbería Yerko",
  "address": "Dirección de la barbería",
  "phone": "+56 9 XXXX XXXX",
  "email": "yerko@barberia.com",
  "instagram": "@yerkobarber"
}');
```

### 3. Instalación de Dependencias

```bash
# En el directorio apps/web
pnpm install @supabase/supabase-js @supabase/auth-ui-react
```

### 4. Ejecutar la Aplicación

```bash
# Modo Individual (Yerko)
pnpm dev

# O específicamente:
VITE_APP_MODE=individual pnpm dev
```

## 🎨 Componentes Creados

### Autenticación
- `src/lib/supabase.ts` - Configuración de Supabase
- `src/hooks/useAuthIndividual.tsx` - Hook de autenticación personalizado
- `src/components/auth/LoginIndividual.tsx` - Componente de login
- `src/components/auth/ProtectedRoute.tsx` - Protección de rutas

### Datos y Configuración
- `src/data/yerkoServices.ts` - Servicios, horarios y configuración

### Componentes Principales
- `src/AppYerko.tsx` - Aplicación principal personalizada
- `src/components/LandingPageYerko.tsx` - Landing page personalizada
- `src/components/BookingSystemYerko.tsx` - Sistema de reservas simplificado
- `src/components/AdminPanelYerko.tsx` - Panel admin personalizado

### Componentes Administrativos
- `src/components/admin/ConfiguracionYerko.tsx` - Panel de configuración
- `src/components/admin/GestionServiciosYerko.tsx` - Gestión de servicios
- `src/components/admin/GestionReservasYerko.tsx` - Gestión de reservas

## 🔄 Cambiar Entre Versiones

El sistema permite cambiar fácilmente entre la versión original y la versión de Yerko:

### Versión Original (Multi-barbero)
```env
VITE_APP_MODE=original
```

### Versión Individual (Yerko)
```env
VITE_APP_MODE=individual
```

## 📱 Rutas de la Aplicación

### Versión Yerko
- `/` - Landing page personalizada
- `/reservar` - Sistema de reservas simplificado
- `/login` - Login de administrador
- `/admin` - Panel de administración (protegido)

## 🎯 Funcionalidades Específicas del Plan Individual

### ✅ Incluidas
- Dashboard personalizado con métricas de Yerko
- Sistema de reservas simplificado (sin selección de barbero)
- Gestión completa de servicios personalizados
- Configuración de horarios y disponibilidad
- Gestión de vacaciones y bloqueos de tiempo
- Calendario inteligente optimizado
- Notificaciones automáticas por email
- Recordatorios de citas
- Branding personalizado
- Reportes básicos de ingresos y citas

### ❌ Excluidas (del plan empresarial)
- Gestión de múltiples barberos
- Roles y permisos complejos
- Reportes avanzados de staff
- Gestión de inventario avanzada
- Integración con sistemas de nómina
- API para terceros

## 🚀 Despliegue

### Variables de Producción
```env
VITE_NODE_ENV=production
VITE_APP_MODE=individual
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Build
```bash
pnpm build
```

## 📞 Información de Contacto

- **Instagram**: @yerkobarber
- **Email**: yerko@barberia.com
- **WhatsApp**: +56 9 XXXX XXXX
- **Horarios**: 11:00 - 20:00 (Lun-Sáb)
- **Almuerzo**: 14:00 - 15:00

## 🔧 Soporte Técnico

Para soporte técnico o modificaciones adicionales, contactar al equipo de desarrollo.

---

**✨ Sistema completamente funcional y listo para producción ✨**

*Barbería Yerko - Plan Individual - Implementación Completa*