# 🔐 **CONFIGURACIÓN GOOGLE OAUTH PARA SUPABASE**

## 📋 **Resumen Implementado**

### ✅ **Componentes creados:**
1. **`GoogleAuthButton`** - Botón para iniciar sesión con Google
2. **`/auth/callback`** - Página para manejar respuesta de Google
3. **Login actualizado** - Incluye opción de Google OAuth

### ✅ **Flujo de autenticación:**
1. Usuario hace clic en "Continuar con Google"
2. Redirige a Google OAuth
3. Google redirige de vuelta a `/auth/callback`
4. Supabase procesa la autenticación
5. Usuario es enviado al dashboard

## 🚀 **Pasos para configurar Google OAuth**

### **Paso 1: Crear aplicación en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API** y **Google Identity API**

### **Paso 2: Configurar OAuth Consent Screen**

1. Ve a **APIs & Services > OAuth consent screen**
2. Selecciona **External** (para usuarios públicos)
3. Completa la información básica:
   - **App name:** Tu SaaS de Reservas
   - **User support email:** tu-email@dominio.com
   - **Developer contact:** tu-email@dominio.com
4. Agrega **Scopes** necesarios:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`

### **Paso 3: Crear OAuth 2.0 Client ID**

1. Ve a **APIs & Services > Credentials**
2. Clic en **+ CREATE CREDENTIALS > OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name:** SaaS Reservas Web Client
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://tu-dominio.vercel.app
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000/auth/callback
     https://tu-dominio.vercel.app/auth/callback
     https://[proyecto-id].supabase.co/auth/v1/callback
     ```

### **Paso 4: Obtener credenciales**

Después de crear, obtienes:
- **Client ID:** `1234567890-abcdef.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-AbCdEf123456789`

### **Paso 5: Configurar en Supabase**

1. Ve a tu **Supabase Dashboard**
2. Ve a **Authentication > Providers**
3. Habilita **Google**
4. Configura:
   - **Client ID:** `1234567890-abcdef.apps.googleusercontent.com`
   - **Client Secret:** `GOCSPX-AbCdEf123456789`
   - **Redirect URL:** (Se autocompletará)

### **Paso 6: Instalar dependencias**

```bash
npm install react-icons
```

### **Paso 7: Variables de entorno**

En tu `.env.local`:
```env
# Ya tienes estas:
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Google OAuth (opcional, ya están en Supabase)
# GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEf123456789
```

## 🔧 **URLs importantes para configurar**

### **Development (localhost:3000):**
- **Authorized origins:** `http://localhost:3000`
- **Redirect URI:** `http://localhost:3000/auth/callback`

### **Production (Vercel):**
- **Authorized origins:** `https://tu-app.vercel.app`
- **Redirect URI:** `https://tu-app.vercel.app/auth/callback`

### **Supabase:**
- **Redirect URI:** `https://[proyecto-id].supabase.co/auth/v1/callback`

## 🎯 **Testing del flujo**

### **1. Test local:**
```bash
npm run dev
# Ve a http://localhost:3000/login
# Clic en "Continuar con Google"
# Debe redirigir a Google, luego de vuelta a /auth/callback
```

### **2. Verificar en Supabase:**
- Ve a **Authentication > Users**
- Deberías ver el usuario creado con provider "google"

### **3. Verificar sesión:**
```javascript
// En el navegador (DevTools)
const { data: { user } } = await supabase.auth.getUser()
console.log(user) // Debe mostrar datos del usuario de Google
```

## ⚠️ **Problemas comunes y soluciones**

### **Error: redirect_uri_mismatch**
- **Causa:** La URL de redirect no está registrada en Google
- **Solución:** Agregar exactamente la URL que aparece en el error

### **Error: access_denied**
- **Causa:** Usuario canceló o aplicación no aprobada
- **Solución:** Verificar OAuth Consent Screen está configurado

### **Error: invalid_client**
- **Causa:** Client ID o Secret incorrectos
- **Solución:** Verificar credenciales en Supabase

### **Usuarios no aparecen en Supabase**
- **Causa:** RLS bloqueando o configuración incorrecta
- **Solución:** Verificar que Google esté habilitado en Supabase Auth

## 🚀 **¡Listo para usar!**

Una vez configurado, el flujo será:

1. **Usuario en `/login`** → Clic "Continuar con Google"
2. **Google OAuth** → Autoriza aplicación
3. **Supabase** → Crea/actualiza usuario
4. **`/auth/callback`** → Procesa respuesta
5. **Dashboard** → Usuario logueado

**¡Tu SaaS ahora tiene login con Google completamente funcional!** 🎉