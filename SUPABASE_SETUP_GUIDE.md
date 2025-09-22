# 🚀 Guía Completa de Configuración de Supabase para Agendex

## 📋 **Paso 1: Crear Proyecto en Supabase**

1. **Ve a** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Crea una cuenta** si no tienes una
3. **Crea un nuevo proyecto:**
   - Nombre: `agendex-saas`
   - Database Password: (anota esta contraseña)
   - Región: Selecciona la más cercana a tus usuarios

## 🔑 **Paso 2: Obtener Credenciales**

Una vez creado el proyecto:

1. **Ve a Settings → API**
2. **Copia estos valores:**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## ⚙️ **Paso 3: Configurar Variables de Entorno**

Actualiza tu archivo `.env.local`:

```bash
# Supabase Configuration (REEMPLAZA CON TUS VALORES REALES)
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY-AQUI
SUPABASE_SERVICE_ROLE_KEY=TU-SERVICE-ROLE-KEY-AQUI

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-nextauth-secret-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Agendex"
```

## 🗄️ **Paso 4: Verificar Estado de la Base de Datos**

Antes de ejecutar migraciones, verifica qué tablas ya existen:

1. **Ve a tu proyecto en Supabase Dashboard**
2. **Navega a Table Editor**
3. **Anota qué tablas ves** (si es que hay alguna)

### Posibles escenarios:

#### ✅ **Base de datos vacía:**
- Solo ves tablas del sistema (`auth.users`, etc.)
- ✅ **Procede con el script completo de migración**

#### ⚠️ **Ya tienes algunas tablas:**
- Ves tablas como `tenants`, `bookings`, etc.
- ⚠️ **NECESITAMOS script de migración incremental**

#### ❌ **Estructura diferente:**
- Las tablas tienen nombres/campos diferentes
- ❌ **NECESITAMOS analizar y corregir el código**

## 🔍 **Paso 5: Inspeccionar Estructura Existente (si aplica)**

Si ya tienes tablas, ejecuta estas consultas en el **SQL Editor** de Supabase:

```sql
-- Ver todas las tablas en el esquema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver estructura de la tabla tenants (si existe)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants';

-- Ver estructura de otras tablas críticas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('users', 'providers', 'services', 'bookings');
```

## 📊 **Paso 6: Ejecutar Migración Correcta**

Basado en lo que encuentres:

### **Escenario A: Base de datos nueva/vacía**
```sql
-- Ejecuta el archivo completo: supabase-migrations.sql
-- en el SQL Editor de Supabase Dashboard
```

### **Escenario B: Tablas existentes pero incompletas**
```sql
-- Ejecuta solo las partes que faltan
-- (te ayudaré a generar este script)
```

### **Escenario C: Conflictos de estructura**
```sql
-- Ejecuta scripts de ALTER TABLE
-- para corregir campos faltantes/incorrectos
-- (te ayudaré a generar este script)
```

## ✅ **Paso 7: Verificar Configuración**

1. **Ejecuta tu proyecto:**
   ```bash
   npm run dev
   ```

2. **Ve a** `http://localhost:3000/setup`
   - Debería mostrar ✅ Supabase configurado correctamente

3. **Prueba el login:**
   - Ve a `/login`
   - Los errores 400/500 deberían desaparecer

## 🆘 **Resolución de Problemas**

### Error: "Invalid API key"
- ✅ Verifica que copiaste las claves completas
- ✅ Asegúrate de no tener espacios extra

### Error: "Network request failed"
- ✅ Verifica que la URL del proyecto sea correcta
- ✅ Asegúrate de que el proyecto esté activo

### Error: "relation does not exist"
- ✅ Ejecuta las migraciones SQL en Supabase
- ✅ Verifica que las tablas se crearon correctamente

---

## 📞 **¿Necesitas Ayuda?**

Dime exactamente en qué paso estás y qué ves en tu dashboard de Supabase para poder ayudarte con el script exacto que necesitas.