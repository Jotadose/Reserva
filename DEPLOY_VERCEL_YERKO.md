# 🚀 Guía de Despliegue en Vercel - Sistema Yerko

## 📋 Checklist Pre-Despliegue

Antes de desplegar, asegúrate de tener:
- ✅ Código actualizado con las correcciones
- ✅ Proyecto de Supabase creado
- ✅ Variables de entorno listas
- ✅ Cuenta en Vercel

## 🔧 Paso 1: Preparar el Repositorio

### Verificar Estructura del Proyecto
Tu proyecto debe tener esta estructura:
```
Reserva/
├── apps/
│   └── web/          # Tu aplicación principal
├── packages/
├── package.json      # Configuración del monorepo
└── turbo.json       # Configuración de Turborepo
```

### Configurar Build Commands
En `apps/web/package.json`, verifica que tengas:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "dev": "vite dev"
  }
}
```

## 🌐 Paso 2: Desplegar en Vercel

### Opción A: Desde GitHub (Recomendado)
1. **Sube tu código a GitHub**:
   ```bash
   git add .
   git commit -m "feat: sistema completo Yerko listo para producción"
   git push origin main
   ```

2. **Conectar con Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "New Project"
   - Importa tu repositorio de GitHub
   - Selecciona el framework: **Vite**
   - Root Directory: `apps/web`

### Opción B: Desde CLI de Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Navegar a tu proyecto
cd apps/web

# Desplegar
vercel
```

## ⚙️ Paso 3: Configurar Variables de Entorno

### En el Dashboard de Vercel:
1. Ve a tu proyecto → **Settings** → **Environment Variables**
2. Agrega **TODAS** estas variables:

```env
# 🗄️ SUPABASE (OBLIGATORIO)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# 🎯 CONFIGURACIÓN DE LA APP (OBLIGATORIO)
VITE_APP_MODE=individual

# 👤 INFORMACIÓN DEL BARBERO
VITE_YERKO_BARBER_NAME=Yerko
VITE_YERKO_BARBER_ID=yerko-001

# 🏢 INFORMACIÓN DEL NEGOCIO
VITE_YERKO_BUSINESS_NAME=Barbería Yerko
VITE_YERKO_EMAIL=yerko@barberia.com
VITE_YERKO_PHONE=+56912345678
VITE_YERKO_INSTAGRAM=@barberia_yerko
VITE_YERKO_ADDRESS=Tu dirección completa aquí

# ⏰ HORARIOS DE TRABAJO
VITE_YERKO_WORK_START=09:00
VITE_YERKO_WORK_END=19:00
VITE_YERKO_LUNCH_START=13:00
VITE_YERKO_LUNCH_END=14:00
```

### ⚠️ IMPORTANTE:
- Después de agregar las variables, haz **"Redeploy"**
- Las variables deben empezar con `VITE_` para ser accesibles en el frontend
- No incluyas espacios ni comillas extra

## 🗄️ Paso 4: Configurar Supabase

### Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. **Create New Project**
3. Elige:
   - **Name**: `yerko-barberia`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: South America (más cercano)

### Obtener Credenciales
1. En tu proyecto de Supabase:
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### Crear Tablas
1. Ve a **SQL Editor**
2. Ejecuta el SQL de la guía principal
3. Verifica que se crearon las tablas: `servicios`, `reservas`, `configuracion`

### Crear Usuario Admin
1. **Authentication** → **Users** → **Add user**
2. Email: `yerko@barberia.com`
3. Password: `yerko123` (cámbiala después)
4. **Auto Confirm User**: ✅ Activado

## 🔍 Paso 5: Verificar el Despliegue

### URLs a Probar:
- **Landing**: `https://tu-proyecto.vercel.app/`
- **Reservas**: `https://tu-proyecto.vercel.app/reservar`
- **Admin**: `https://tu-proyecto.vercel.app/admin`

### Checklist de Verificación:
- ✅ La landing page carga correctamente
- ✅ El sistema de reservas funciona
- ✅ Puedes acceder al admin con las credenciales
- ✅ Las reservas se guardan en Supabase
- ✅ Los servicios aparecen correctamente
- ✅ El diseño se ve bien en móvil

## 🚨 Solución de Problemas Comunes

### ❌ Error: "Build Failed"
**Causa**: Problemas en el código o dependencias
**Solución**:
```bash
# Probar build localmente
cd apps/web
npm run build

# Si falla, revisar errores y corregir
# Luego hacer commit y push
```

### ❌ Error: "Environment Variables Not Found"
**Causa**: Variables mal configuradas
**Solución**:
1. Verifica que todas las variables estén en Vercel
2. Asegúrate de que empiecen con `VITE_`
3. Haz **Redeploy** después de agregar variables

### ❌ Error: "Cannot Connect to Database"
**Causa**: Supabase mal configurado
**Solución**:
1. Verifica URL y Key de Supabase
2. Asegúrate de que el proyecto esté activo
3. Revisa que las tablas existan

### ❌ Error: "Page Not Found" en /admin
**Causa**: Routing o variables incorrectas
**Solución**:
1. Verifica `VITE_APP_MODE=individual`
2. Haz Redeploy
3. Espera 2-3 minutos para propagación

## 📱 Configuración de Dominio Personalizado

### Agregar Dominio Propio:
1. En Vercel: **Settings** → **Domains**
2. Agrega tu dominio: `barberiayerko.com`
3. Configura DNS según las instrucciones
4. Espera propagación (hasta 24 horas)

### Actualizar URLs:
Una vez que tengas dominio propio, actualiza:
- Variables de entorno si es necesario
- Enlaces en redes sociales
- Información de contacto

## 🔄 Flujo de Actualizaciones

### Para Hacer Cambios:
1. **Edita el código localmente**
2. **Prueba los cambios**: `npm run dev`
3. **Commit y push**:
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin main
   ```
4. **Vercel despliega automáticamente**
5. **Verifica en producción**

## 📊 Monitoreo y Analytics

### En Vercel Dashboard:
- **Functions**: Rendimiento de la app
- **Analytics**: Visitantes y uso
- **Speed Insights**: Velocidad de carga

### En Supabase Dashboard:
- **Database**: Uso de la base de datos
- **Auth**: Usuarios registrados
- **API**: Llamadas a la API

## 🎯 Próximos Pasos Recomendados

### Inmediatos:
1. ✅ Cambiar credenciales por unas seguras
2. ✅ Agregar servicios reales de tu barbería
3. ✅ Personalizar información de contacto
4. ✅ Probar el sistema completo

### A Mediano Plazo:
1. 📱 Configurar notificaciones push
2. 💳 Integrar pagos online (opcional)
3. 📧 Configurar emails automáticos
4. 📊 Agregar más analytics

### Mantenimiento:
1. 🔄 Backup regular de Supabase
2. 🔐 Revisar seguridad mensualmente
3. 📈 Monitorear rendimiento
4. 🆕 Actualizar dependencias

## 🎉 ¡Felicidades!

Tu sistema de reservas está **100% funcional** en producción:
- ✅ **24/7 disponible** para tus clientes
- ✅ **Responsive** en todos los dispositivos
- ✅ **Base de datos real** con Supabase
- ✅ **Panel admin completo** para gestionar todo
- ✅ **Escalable** para crecer con tu negocio

**🔗 Enlaces Útiles:**
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Soporte de Vite](https://vitejs.dev/guide/)

¡Tu barbería ya está en el futuro digital! 🚀✂️