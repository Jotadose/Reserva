# 🔧 VERIFICACIÓN DE URL CORRECTA DE SUPABASE

## 📍 CÓMO ENCONTRAR TU URL CORRECTA:

1. Ve a [supabase.com](https://supabase.com)
2. Abre tu proyecto: **qvxwfkbcrunaebahpmft**
3. Ve a **Settings** → **API**
4. Busca **"Project URL"**
5. Debería ser: `https://qvxwfkbcrunaebahpmft.supabase.co`

## ❌ URL INCORRECTA (lo que tienes ahora):

```
postgresql://postgres.qvxwfkbcrunaebahpmft:WztnPcwfOtD62dp1@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

## ✅ URL CORRECTA (lo que necesitas):

```
https://qvxwfkbcrunaebahpmft.supabase.co
```

## 🚀 EN VERCEL:

**Variable:** `VITE_SUPABASE_URL`
**Valor:** `https://qvxwfkbcrunaebahpmft.supabase.co`
**Environments:** Production, Preview, Development

## ⚠️ IMPORTANTE:

- NO uses la URL que empieza con `postgresql://`
- NO uses la URL que termina en `:6543/postgres`
- SÍ usa la URL que empieza con `https://`
- SÍ usa la URL que termina en `.supabase.co`

La URL de PostgreSQL es para conexiones directas de base de datos.
La URL HTTPS es para la API REST que usa el cliente JavaScript.
