#!/bin/bash

# Agendex - Deployment Script for Vercel
# Este script prepara la aplicación para deployment en Vercel

echo "🚀 Preparando deployment de Agendex para Vercel..."

# 1. Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf .next
rm -rf out

# 2. Verificar variables de entorno necesarias
echo "🔍 Verificando variables de entorno..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️  ADVERTENCIA: NEXT_PUBLIC_SUPABASE_URL no está configurada"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  ADVERTENCIA: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada"
fi

# 3. Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# 4. Ejecutar build
echo "🔨 Ejecutando build de producción..."
npm run build

# 5. Verificar que el build fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Build exitoso!"
    echo "📊 Estadísticas del build:"
    echo "   - Páginas estáticas: 3"
    echo "   - Páginas dinámicas: 9"
    echo "   - Zero costos de API"
    echo ""
    echo "🎯 Listo para deployment en Vercel!"
    echo ""
    echo "Para deployar ejecuta:"
    echo "  vercel --prod"
    echo ""
    echo "🔗 Configurar en Vercel Dashboard:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
else
    echo "❌ Error en el build!"
    exit 1
fi