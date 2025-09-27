# Configuración de Storage para Branding - Guía Supabase Dashboard

Como no podemos crear las políticas de storage desde SQL (permisos limitados), debes configurarlas desde el Dashboard de Supabase.

## 🚀 **Paso 1: Ejecutar Migración de Base de Datos**

Ejecuta la migración simple:
```sql
-- Ejecutar: migration_002_branding_database_only.sql
-- Solo modifica la tabla tenants, no toca storage
```

## 🗂️ **Paso 2: Crear Bucket en Supabase Dashboard**

1. **Ir a Supabase Dashboard** → Tu proyecto
2. **Storage** → **Buckets**
3. **Create Bucket**:
   - **Name**: `tenant-assets`
   - **Public**: ✅ **SÍ** (para que las imágenes sean visibles)
   - **File size limit**: 50MB (o lo que prefieras)
   - **Allowed MIME types**: `image/*` (opcional)

## 🔐 **Paso 3: Configurar Políticas RLS**

### **3.1 Ir a Policies**
- **Storage** → **Policies** → **tenant-assets bucket**

### **3.2 Crear Política de INSERT (Upload)**
- **Add Policy** → **For full customization**
- **Policy Name**: `Tenant members can upload assets`
- **Allowed Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
bucket_id = 'tenant-assets' 
AND (
  (storage.foldername(name))[1] IN (
    SELECT t.id::text 
    FROM tenants t 
    JOIN tenant_memberships tm ON t.id = tm.tenant_id 
    WHERE tm.user_id = auth.uid() 
    AND tm.role IN ('owner', 'admin')
  )
  OR
  (storage.foldername(name))[1] IN (
    SELECT t.id::text 
    FROM tenants t 
    WHERE t.owner_id = auth.uid()
  )
)
```

### **3.3 Crear Política de SELECT (View)**
- **Add Policy** → **For full customization**
- **Policy Name**: `Tenant members can view assets`
- **Allowed Operation**: `SELECT`
- **Target Roles**: `anon, authenticated`
- **USING Expression**:
```sql
bucket_id = 'tenant-assets'
```
*(Acceso público para que las imágenes se vean en el landing)*

### **3.4 Crear Política de UPDATE**
- **Add Policy** → **For full customization**
- **Policy Name**: `Tenant members can update assets`
- **Allowed Operation**: `UPDATE`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
bucket_id = 'tenant-assets' 
AND (
  (storage.foldername(name))[1] IN (
    SELECT t.id::text 
    FROM tenants t 
    JOIN tenant_memberships tm ON t.id = tm.tenant_id 
    WHERE tm.user_id = auth.uid() 
    AND tm.role IN ('owner', 'admin')
  )
  OR
  (storage.foldername(name))[1] IN (
    SELECT t.id::text 
    FROM tenants t 
    WHERE t.owner_id = auth.uid()
  )
)
```

### **3.5 Crear Política de DELETE**
- **Add Policy** → **For full customization**
- **Policy Name**: `Tenant members can delete assets`
- **Allowed Operation**: `DELETE`
- **Target Roles**: `authenticated`
- **USING Expression**:
```sql
bucket_id = 'tenant-assets' 
AND (
  (storage.foldername(name))[1] IN (
    SELECT t.id::text 
    FROM tenants t 
    JOIN tenant_memberships tm ON t.id = tm.tenant_id 
    WHERE tm.user_id = auth.uid() 
    AND tm.role IN ('owner', 'admin')
  )
  OR
  (storage.foldername(name))[1] IN (
    SELECT t.id::text 
    FROM tenants t 
    WHERE t.owner_id = auth.uid()
  )
)
```

## ✅ **Paso 4: Verificar Configuración**

### **Verificar Base de Datos**:
```sql
-- Verificar columna branding
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tenants' AND column_name = 'branding';

-- Verificar datos por defecto
SELECT name, branding FROM tenants LIMIT 5;
```

### **Verificar Storage** (desde Dashboard):
- **Storage** → **tenant-assets** → Debería aparecer el bucket
- **Policies** → Deberían aparecer 4 políticas creadas

## 🧪 **Paso 5: Probar Funcionalidad**

1. **Ir al Dashboard** → `/{barberia}/settings`
2. **Cambiar colores** → Debería funcionar (se guarda en DB)
3. **Subir imágenes** → Debería funcionar (se guarda en storage)
4. **Ver landing** → `/{barberia}` → Colores e imágenes aplicados

## 🚨 **Troubleshooting**

### **Si las imágenes no se suben**:
- Verificar que el bucket `tenant-assets` existe
- Verificar que el bucket es **público**
- Verificar que la política de INSERT existe y es correcta

### **Si las imágenes no se ven**:
- Verificar que la política de SELECT permite acceso `anon` (público)
- Verificar que las URLs generadas son públicas

### **Si get error de permisos**:
- Verificar que tu usuario tiene membresía en el tenant
- Verificar que el rol es `owner` o `admin`
- O verificar que eres el `owner_id` del tenant (sistema legacy)

## 📝 **Resumen de lo que hace cada política**:

- **INSERT**: Solo owners/admins pueden subir imágenes a SU tenant
- **SELECT**: Cualquiera puede VER las imágenes (público)
- **UPDATE**: Solo owners/admins pueden actualizar imágenes de SU tenant
- **DELETE**: Solo owners/admins pueden borrar imágenes de SU tenant

¡Con esto el sistema de branding debería funcionar completamente! 🎨✨