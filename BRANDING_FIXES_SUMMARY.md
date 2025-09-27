# Correcciones de Branding - Storage y Color de Texto

Este documento detalla las correcciones implementadas para resolver los problemas de storage y agregar el color de texto personalizable.

## 🚨 **Problemas Identificados y Solucionados**

### **1. Error de Storage RLS (Row Level Security)**
**Problema**: `StorageApiError: new row violates row-level security policy`

**Causa**: Las políticas de storage eran muy restrictivas y no contemplaban el sistema de tenancy actual.

**Solución**: ✅ **Políticas RLS Mejoradas**
```sql
-- Soporte para tenant_memberships Y fallback para owner_id
CREATE POLICY "Tenant members can upload assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tenant-assets' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Nuevo sistema: tenant_memberships
    (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      JOIN tenant_memberships tm ON t.id = tm.tenant_id 
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin')
    )
    OR
    -- Sistema legacy: owner_id directo
    (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      WHERE t.owner_id = auth.uid()
    )
  )
);
```

### **2. Falta de Color de Texto Personalizable**
**Problema**: Solo había colores para elementos de UI, pero no para textos principales.

**Solución**: ✅ **Color de Texto Agregado**

## 🎨 **Nuevas Funcionalidades Implementadas**

### **1. Color de Texto Personalizable**

#### **En Base de Datos**:
```sql
-- Valor por defecto actualizado
UPDATE tenants 
SET branding = '{
  "primaryColor": "#8B5CF6",
  "secondaryColor": "#EC4899", 
  "buttonColor": "#10B981",
  "textColor": "#F3F4F6",  -- 👈 NUEVO
  "logoUrl": null,
  "coverImageUrl": null
}'::jsonb
```

#### **En TypeScript**:
```typescript
interface Tenant {
  branding?: {
    primaryColor: string
    secondaryColor: string
    buttonColor: string
    textColor: string  // 👈 NUEVO
    logoUrl?: string
    coverImageUrl?: string
  }
}
```

#### **En Hook de Branding**:
```typescript
const colors: BrandingColors = {
  primary: tenant?.branding?.primaryColor || '#8B5CF6',
  secondary: tenant?.branding?.secondaryColor || '#EC4899',
  button: tenant?.branding?.buttonColor || '#10B981',
  text: tenant?.branding?.textColor || '#F3F4F6'  // 👈 NUEVO
}

// Variable CSS
root.style.setProperty('--brand-text', colors.text)

// Función de estilo
const getTextStyle = () => ({ color: colors.text })
```

#### **En CSS**:
```css
.text-brand-text {
  color: var(--brand-text);
}
```

### **2. Interfaz de Usuario Actualizada**

#### **Dashboard Settings**:
- ✅ Color picker para "Color de Texto"
- ✅ Preview en tiempo real
- ✅ Guardado en branding settings

#### **Onboarding**:
- ✅ Paso 4 incluye color de texto
- ✅ Validación actualizada
- ✅ Vista previa con color personalizado

## 🔧 **Cambios Técnicos Detallados**

### **1. Políticas de Storage Mejoradas**
```sql
-- Upload Policy: Soporte dual para tenant_memberships y owner_id
-- View Policy: Acceso público para imágenes + control de miembros
-- Update/Delete Policy: Solo owner/admin con fallback a owner_id
```

### **2. Variables CSS Dinámicas**
```css
:root {
  --brand-primary: #8B5CF6;
  --brand-secondary: #EC4899;
  --brand-button: #10B981;
  --brand-text: #F3F4F6;  /* 👈 NUEVO */
  
  /* Variantes automáticas */
  --brand-text-light: #F3F4F680;
  --brand-text-dark: #F3F4F640;
}
```

### **3. Funciones de Estilo**
```typescript
const {
  colors,
  getGradientStyle,    // Gradiente primario → secundario
  getPrimaryStyle,     // Color primario sólido
  getSecondaryStyle,   // Color secundario sólido
  getButtonStyle,      // Color de botón sólido
  getTextStyle,        // Color de texto sólido 👈 NUEVO
  logoUrl,             // URL del logo personalizado
  coverImageUrl        // URL de imagen de portada
} = useBranding()
```

## 🎯 **Uso en Componentes**

### **Landing Page**:
```typescript
// Fondo dinámico
<div style={getGradientStyle()}>

// Logo personalizado
{logoUrl ? (
  <img src={logoUrl} alt="Logo" />
) : (
  <div style={getGradientStyle()}>
    <Scissors />
  </div>
)}

// Botones dinámicos
<Button style={getButtonStyle()}>Reservar</Button>

// Textos con color personalizado
<p style={getTextStyle()}>Mi texto personalizado</p>
```

## 📋 **Para Aplicar las Correcciones**

### **1. Ejecutar Migración Actualizada**:
```bash
# Ejecutar migration_002_branding_support.sql actualizada
# Incluye las políticas RLS corregidas y textColor
```

### **2. Verificar Storage**:
```sql
-- Verificar que las políticas existen
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Verificar bucket
SELECT * FROM storage.buckets WHERE id = 'tenant-assets';
```

### **3. Probar Funcionalidades**:
1. **Dashboard → Configuración** → Cambiar colores y subir imágenes
2. **Onboarding** → Crear barbería con colores personalizados
3. **Landing** → Verificar que se aplican los colores dinámicos

## ✅ **Estado Final**

- ✅ **Storage corregido**: RLS policies soportan tenant_memberships y owner_id
- ✅ **Color de texto agregado**: Personalizable en UI y aplicado dinámicamente
- ✅ **Interfaz completa**: Dashboard y Onboarding actualizados
- ✅ **CSS dinámico**: Variables CSS aplicadas automáticamente
- ✅ **Build exitoso**: Compila sin errores
- ✅ **Tipos actualizados**: TypeScript interfaces completas

¡Ahora las imágenes se pueden subir correctamente y hay un color personalizable para textos! 🎨✨