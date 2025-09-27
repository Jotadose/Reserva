-- Verificación del Sistema de Branding
-- Ejecutar después de configurar storage en Supabase Dashboard

-- 1. Verificar que la columna branding existe
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tenants' 
AND column_name = 'branding';

-- 2. Verificar que hay tenants con branding configurado
SELECT 
    id,
    name,
    slug,
    branding->>'primaryColor' as primary_color,
    branding->>'secondaryColor' as secondary_color,
    branding->>'buttonColor' as button_color,
    branding->>'textColor' as text_color,
    branding->>'logoUrl' as logo_url,
    branding->>'coverImageUrl' as cover_url
FROM tenants 
WHERE branding IS NOT NULL
LIMIT 10;

-- 3. Verificar índice en branding
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'tenants' 
AND indexname = 'idx_tenants_branding';

-- 4. Contar tenants con y sin branding
SELECT 
    'Con branding configurado' as status,
    COUNT(*) as cantidad
FROM tenants 
WHERE branding IS NOT NULL AND branding != '{}'::jsonb

UNION ALL

SELECT 
    'Sin branding' as status,
    COUNT(*) as cantidad
FROM tenants 
WHERE branding IS NULL OR branding = '{}'::jsonb;

-- 5. Verificar tenants que necesitan actualizar textColor
SELECT 
    id,
    name,
    slug,
    branding
FROM tenants 
WHERE branding IS NOT NULL 
AND branding->>'textColor' IS NULL;

-- 6. Ejemplo de como actualizar un tenant específico (opcional)
-- UPDATE tenants 
-- SET branding = jsonb_set(
--     COALESCE(branding, '{}'::jsonb),
--     '{textColor}',
--     '"#F3F4F6"'
-- )
-- WHERE slug = 'tu-barberia'
-- AND (branding->>'textColor' IS NULL);

-- 7. Ver estructura completa de branding de un tenant
SELECT 
    name,
    slug,
    jsonb_pretty(branding) as branding_formatted
FROM tenants 
WHERE branding IS NOT NULL
LIMIT 3;