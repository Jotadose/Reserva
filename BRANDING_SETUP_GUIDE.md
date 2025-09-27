# Configuración de Personalización Visual - Migración

Este documento explica cómo agregar la funcionalidad de personalización visual a barberías existentes.

## 🚀 **¿Qué es esto?**

Hemos agregado un sistema completo de **personalización visual** que permite a cada barbería:
- Seleccionar colores primario, secundario y de botones
- Subir su logo y imagen de portada  
- Ver una vista previa en tiempo real de sus cambios
- Aplicar su marca personal en toda la interfaz

## 📋 **Pasos para la Migración**

### 1. **Ejecutar la Migración de Base de Datos**

Ejecuta el archivo `migration_002_branding_support.sql` en tu base de datos Supabase:

```sql
-- Copiar y pegar todo el contenido del archivo:
-- migration_002_branding_support.sql
```

Esta migración:
- ✅ Agrega la columna `branding` a la tabla `tenants`
- ✅ Crea el bucket de almacenamiento `tenant-assets` 
- ✅ Configura políticas de acceso para subir/ver imágenes
- ✅ Asigna colores por defecto a barberías existentes

### 2. **Verificar la Migración**

Después de ejecutar la migración, verifica que:

```sql
-- Verificar que la columna branding existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'branding';

-- Verificar que los tenants existentes tienen branding por defecto
SELECT name, branding FROM tenants LIMIT 5;

-- Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE id = 'tenant-assets';
```

### 3. **Acceso desde el Dashboard**

Las barberías existentes ya pueden acceder a la configuración:

1. **Ir al Dashboard** → `/{barberia}/dashboard`
2. **Clic en "Configuración"** en el menú lateral
3. **Personalizar colores e imágenes**
4. **Ver vista previa en tiempo real**
5. **Guardar cambios**

## 🎨 **Funcionalidades Disponibles**

### **Personalización de Colores**
- **Color Primario**: Para gradientes y elementos principales
- **Color Secundario**: Para gradientes y elementos de apoyo  
- **Color de Botones**: Para todos los botones de acción

### **Gestión de Imágenes**
- **Logo**: Imagen cuadrada para identificación
- **Portada**: Imagen panorámica para headers y fondos

### **Vista Previa**
- **Tiempo Real**: Los cambios se reflejan instantáneamente
- **Simulación Realista**: Muestra cómo se verá la interfaz final
- **Paleta de Colores**: Visualiza la combinación elegida

## 🔧 **Cambios Técnicos Realizados**

### **Base de Datos**
- ✅ Columna `branding` en tabla `tenants` (JSONB)
- ✅ Bucket `tenant-assets` para almacenamiento
- ✅ Políticas RLS para seguridad de archivos

### **Tipos TypeScript**
- ✅ Interface `Tenant` actualizada con `branding`
- ✅ Interface `BrandingSettings` para configuración

### **Hooks**
- ✅ `use-tenant` actualizado para incluir branding
- ✅ Función `refetch()` para actualizar datos

### **Componentes**
- ✅ `ColorPicker` reutilizable
- ✅ Página `/settings` completa
- ✅ Navegación desde dashboard

### **Onboarding**
- ✅ Paso 4 agregado para nuevas barberías
- ✅ Confirmación con vista previa incluida

## 🎯 **Resultado Final**

### **Para Nuevas Barberías**
- Configuran su marca durante el onboarding
- Proceso completo y guiado

### **Para Barberías Existentes**  
- Acceden desde Configuración en dashboard
- Colores por defecto ya asignados
- Pueden personalizar cuando quieran

## 🔍 **Verificación de Funcionamiento**

1. **Crear una barbería nueva** → Debe mostrar paso de branding
2. **Entrar a una barbería existente** → Dashboard → Configuración
3. **Cambiar colores** → Ver vista previa actualizada
4. **Subir imágenes** → Verificar almacenamiento correcto
5. **Guardar cambios** → Confirmar persistencia de datos

## 📞 **¿Problemas?**

Si algo no funciona:

1. **Verificar migración** → Ejecutar queries de verificación
2. **Revisar permisos** → Policies de Supabase activas
3. **Comprobar tipos** → TypeScript compilando sin errores
4. **Validar storage** → Bucket y políticas configuradas

¡Listo! 🎉 Ahora todas las barberías pueden personalizar su marca visual.