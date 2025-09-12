# 🔐 Guía de Acceso al Panel de Administración - Yerko (PRODUCCIÓN)

## 🌐 Acceso en Producción (Vercel)

### 🚀 URLs de Acceso:
- **Landing Page**: `https://tu-dominio.vercel.app/`
- **Panel Admin**: `https://tu-dominio.vercel.app/admin`
- **Sistema de Reservas**: `https://tu-dominio.vercel.app/reservar`

### 🔑 Acceso al Admin desde la Web:
1. Ve a tu sitio en Vercel
2. En el footer de la página principal, haz clic en "Admin" (enlace pequeño)
3. Te llevará al login del administrador

## 🗄️ Configuración de Supabase (OBLIGATORIO)

### Paso 1: Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Anota la **URL del proyecto** y la **clave anónima**

### Paso 2: Configurar Variables en Vercel
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega estas variables:

```env
# Supabase (OBLIGATORIO)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Modo de la App (OBLIGATORIO)
VITE_APP_MODE=individual

# Configuración de Yerko
VITE_YERKO_BARBER_NAME=Yerko
VITE_YERKO_BARBER_ID=yerko-001
VITE_YERKO_BUSINESS_NAME=Barbería Yerko
VITE_YERKO_EMAIL=yerko@barberia.com
VITE_YERKO_PHONE=+56912345678
VITE_YERKO_INSTAGRAM=@barberia_yerko
VITE_YERKO_ADDRESS=Tu dirección aquí

# Horarios
VITE_YERKO_WORK_START=09:00
VITE_YERKO_WORK_END=19:00
VITE_YERKO_LUNCH_START=13:00
VITE_YERKO_LUNCH_END=14:00
```

4. **Importante**: Después de agregar las variables, haz **Redeploy** del proyecto

### Paso 3: Crear Tablas en Supabase
1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Ejecuta este código SQL:

```sql
-- Tabla de servicios
CREATE TABLE servicios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  duracion INTEGER NOT NULL, -- en minutos
  categoria VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas
CREATE TABLE reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nombre VARCHAR(100) NOT NULL,
  cliente_email VARCHAR(100) NOT NULL,
  cliente_telefono VARCHAR(20),
  servicio_id UUID REFERENCES servicios(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración
CREATE TABLE configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave VARCHAR(50) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar servicios iniciales
INSERT INTO servicios (nombre, descripcion, precio, duracion, categoria) VALUES
('Corte Clásico', 'Corte tradicional con tijera y máquina', 15000, 30, 'corte'),
('Corte + Barba', 'Corte completo más arreglo de barba', 25000, 45, 'combo'),
('Solo Barba', 'Arreglo y perfilado de barba', 12000, 20, 'barba'),
('Corte Premium', 'Corte personalizado con lavado', 20000, 40, 'premium');

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('horario_inicio', '09:00', 'Hora de inicio de atención'),
('horario_fin', '19:00', 'Hora de fin de atención'),
('almuerzo_inicio', '13:00', 'Inicio del descanso'),
('almuerzo_fin', '14:00', 'Fin del descanso'),
('dias_habiles', 'lunes,martes,miercoles,jueves,viernes,sabado', 'Días de atención');
```

### Paso 4: Crear Usuario Administrador
1. En Supabase, ve a **Authentication** → **Users**
2. Haz clic en **Add user**
3. Agrega:
   - **Email**: `yerko@barberia.com` (o tu email)
   - **Password**: `yerko123` (o tu contraseña segura)
4. Confirma el usuario

## 🔐 Credenciales de Acceso

### Para Acceder al Admin:
- **Email**: `yerko@barberia.com`
- **Password**: `yerko123`

**⚠️ IMPORTANTE**: Cambia estas credenciales por unas seguras en producción.

## 🎯 Funcionalidades del Panel Admin

### Dashboard Principal
- 📊 Estadísticas de reservas (día/semana/mes)
- 📅 Reservas pendientes de hoy
- 💰 Ingresos estimados
- 📈 Gráficos de rendimiento

### Gestión de Reservas
- ✅ Ver todas las reservas
- 🔍 Filtrar por fecha/estado/cliente
- ✅ Confirmar reservas pendientes
- ❌ Cancelar reservas
- 👁️ Ver detalles completos del cliente
- 📧 Información de contacto

### Gestión de Servicios
- ➕ Agregar nuevos servicios
- ✏️ Editar servicios existentes
- 🗑️ Eliminar servicios
- 💰 Configurar precios
- ⏱️ Establecer duración
- 🏷️ Organizar por categorías

### Configuración General
- 🕐 Horarios de atención
- 📞 Información de contacto
- 🏖️ Períodos de vacaciones
- ⚙️ Configuración del negocio

## 🚨 Solución de Problemas

### ❌ Error: "No se puede conectar a la base de datos"
**Solución**:
1. Verifica que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas en Vercel
2. Asegúrate de haber hecho **Redeploy** después de agregar las variables
3. Verifica que tu proyecto de Supabase esté activo

### ❌ Error: "Usuario no autorizado"
**Solución**:
1. Verifica que el usuario esté creado en Supabase Authentication
2. Asegúrate de usar el email exacto configurado
3. Verifica que el usuario esté confirmado

### ❌ Error: "Página no encontrada" en /admin
**Solución**:
1. Verifica que `VITE_APP_MODE=individual` esté configurado en Vercel
2. Haz **Redeploy** del proyecto
3. Espera unos minutos para que se propague

### ❌ Error de JavaScript en el navegador
**Solución**:
Este error ya está corregido en el código. Si persiste:
1. Limpia la caché del navegador (Ctrl+F5)
2. Verifica que tengas la última versión desplegada

## 📱 Uso desde Móvil

El panel admin es **completamente responsive**:
- ✅ Funciona perfectamente en móviles
- ✅ Interfaz adaptada para pantallas pequeñas
- ✅ Todas las funciones disponibles
- ✅ Navegación optimizada para touch

## 🔄 Flujo de Trabajo Recomendado

### Para Gestionar Reservas:
1. Entra al admin: `tu-dominio.vercel.app/admin`
2. Ve a la sección "Reservas"
3. Revisa las reservas pendientes
4. Confirma o cancela según corresponda
5. Contacta a los clientes si es necesario

### Para Gestionar Servicios:
1. Ve a la sección "Servicios"
2. Agrega/edita servicios según tu oferta
3. Ajusta precios según el mercado
4. Organiza por categorías para mejor UX

### Para Configurar el Negocio:
1. Ve a "Configuración"
2. Ajusta horarios de atención
3. Actualiza información de contacto
4. Configura períodos de vacaciones

## 🎉 ¡Sistema Listo!

Una vez completados estos pasos, tendrás:
- ✅ Sistema de reservas funcionando 24/7
- ✅ Panel admin accesible desde cualquier dispositivo
- ✅ Base de datos real con Supabase
- ✅ Gestión completa de tu barbería
- ✅ Interfaz profesional y moderna

**🔗 Enlaces Importantes:**
- Tu sitio web: `https://tu-dominio.vercel.app/`
- Panel admin: `https://tu-dominio.vercel.app/admin`
- Supabase: `https://supabase.com/dashboard`
- Vercel: `https://vercel.com/dashboard`

¡Tu barbería ya está en línea! 🎊