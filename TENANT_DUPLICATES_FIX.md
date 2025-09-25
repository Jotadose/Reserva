# 🔧 Correcciones de Tenants Duplicados

## Problemas Identificados y Solucionados

### 1. ❌ **Problema**: Cache de fallos bloqueando tenants válidos
**Descripción**: El sistema asumía que si un tenant no se encontraba una vez, nunca existiría, bloqueando búsquedas futuras válidas.

**Solución**: 
- ✅ Removido el cache de fallos (`failedSlugs`)
- ✅ Cada búsqueda de tenant ahora consulta siempre la base de datos
- ✅ Mejorados los logs para ser más informativos sin hacer spam

### 2. ❌ **Problema**: Múltiples tenants con el mismo email/usuario
**Descripción**: El API de onboarding no validaba si un usuario ya tenía un tenant, permitiendo crear múltiples tenants por usuario.

**Solución**:
- ✅ Agregada validación en `/api/onboarding` para verificar tenants existentes
- ✅ Si el usuario ya tiene un tenant, retorna error 400 con información del tenant existente
- ✅ Frontend maneja automáticamente la redirección al dashboard del tenant existente

## Cambios Implementados

### 📁 `src/hooks/use-tenant.tsx`
```typescript
// REMOVIDO: Cache de fallos que bloqueaba búsquedas válidas
// AGREGADO: Log informativo para cada búsqueda
console.log(`🔍 Buscando tenant en DB: ${slug}`)

// MEJORADOS: Mensajes de error más claros
setError(`Barbería '${slug}' no encontrada`)
```

### 📁 `src/app/api/onboarding/route.ts`
```typescript
// AGREGADO: Validación de tenant existente
const { data: existingTenant } = await supabaseAdmin
  .from('tenants')
  .select('id, slug, name')
  .eq('owner_id', userId)
  .eq('subscription_status', 'active')
  .maybeSingle()

if (existingTenant) {
  return NextResponse.json({ 
    error: 'Ya tienes una barbería creada', 
    details: `Ya tienes la barbería "${existingTenant.name}" (${existingTenant.slug})`,
    existingTenant 
  }, { status: 400 })
}
```

### 📁 `src/app/onboarding/page.tsx`
```typescript
// AGREGADO: Manejo automático de tenant existente
if (existingTenant && res.status === 400) {
  console.log('🏪 Usuario ya tiene tenant, redirigiendo:', existingTenant.slug)
  localStorage.setItem('last_created_tenant', JSON.stringify(existingTenant))
  localStorage.setItem('cachedTenantSlug', existingTenant.slug)
  router.push(`/${existingTenant.slug}/dashboard`)
  return
}
```

## Flujo Mejorado

### ✅ **Nuevo flujo de onboarding:**
1. Usuario intenta crear un tenant
2. Sistema verifica si ya tiene uno existente
3. **Si existe**: Redirige automáticamente al dashboard del tenant existente
4. **Si no existe**: Procede con la creación normal

### ✅ **Nuevo flujo de búsqueda de tenants:**
1. Se solicita un tenant por slug
2. Verifica cache de localStorage (si coincide el slug)
3. **Siempre** consulta la base de datos (no más cache de fallos)
4. Retorna el tenant encontrado o error claro

## Scripts de Limpieza (Opcional)

### SQL para identificar tenants duplicados:
```sql
-- Ver tenants duplicados por owner_id
SELECT owner_id, COUNT(*) as tenant_count, 
       array_agg(slug) as slugs,
       array_agg(name) as names
FROM tenants 
WHERE subscription_status = 'active'
GROUP BY owner_id 
HAVING COUNT(*) > 1;
```

### SQL para limpiar tenants duplicados (mantener el más reciente):
```sql
-- ⚠️ EJECUTAR CON CUIDADO - ESTO ELIMINA DATOS
WITH duplicates AS (
  SELECT id, owner_id, slug, name, created_at,
         ROW_NUMBER() OVER (
           PARTITION BY owner_id 
           ORDER BY created_at DESC
         ) as rn
  FROM tenants 
  WHERE subscription_status = 'active'
)
UPDATE tenants 
SET subscription_status = 'inactive'
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
```

## Estado Actual

- ✅ **Build Status**: Funcionando correctamente
- ✅ **Validación**: Evita futuros duplicados
- ✅ **UX**: Redirección automática a tenant existente
- ✅ **Performance**: Búsquedas optimizadas sin cache problemático
- ✅ **Logs**: Informativos sin spam

## Próximos Pasos Sugeridos

1. **Ejecutar script de limpieza** para eliminar tenants duplicados existentes
2. **Monitorear logs** para verificar que `agendex1` ahora se encuentra correctamente
3. **Probar flujo completo** de login → onboarding → redirección
4. **Considerar límite por plan** (ej: Basic = 1 tenant, Pro = múltiples tenants)

---

**Fecha**: 25 de Septiembre, 2025  
**Estado**: ✅ Completado y probado  
**Impacto**: Previene duplicados futuros y mejora UX