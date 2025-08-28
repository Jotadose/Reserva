# 🔧 VARIABLES CORRECTAS PARA VERCEL

## ❌ PROBLEMA ACTUAL

Estás usando la URL de PostgreSQL directa:

```
postgresql://postgres.qvxwfkbcrunaebahpmft:WztnPcwfOtD62dp1@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

## ✅ SOLUCIÓN: Usar URL REST API

Ve a Vercel y **REEMPLAZA** las variables con estas correctas:

### 1. VITE_SUPABASE_URL

```
https://qvxwfkbcrunaebahpmft.supabase.co
```

### 2. VITE_SUPABASE_ANON_KEY

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eHdma2JjcnVuYWViYWhwbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTA4MzIsImV4cCI6MjA3MDkyNjgzMn0.MG6D8jFV0q-l0uxFP_3tQ-1ScXvmdckFe-T-_R9pJBA
```

## 🔍 CÓMO ENCONTRAR TUS URLs CORRECTAS

1. Ve a [supabase.com](https://supabase.com)
2. Abre tu proyecto: **qvxwfkbcrunaebahpmft**
3. Settings > API
4. Copia:
   - **Project URL** (debe ser https://qvxwfkbcrunaebahpmft.supabase.co)
   - **anon public** key

## 🚀 PASOS EN VERCEL

1. Ve a vercel.com
2. Proyecto "Reserva"
3. Settings > Environment Variables
4. **EDITA** (no agregues nueva) VITE_SUPABASE_URL:
   - Valor: `https://qvxwfkbcrunaebahpmft.supabase.co`
5. La VITE_SUPABASE_ANON_KEY debería estar bien
6. **Redeploy**

## ⚠️ IMPORTANTE

- Usa **https://**, NO **postgresql://**
- Es la URL REST API, NO la URL de base de datos directa
- Debe terminar en `.supabase.co`, NO en `/postgres`
