-- Migración para agregar configuración de layout al branding
-- Ejecutar después de completar la Fase 3 del sistema de personalización

-- Actualizar la tabla tenants para agregar configuración de layout
-- El campo branding ya existe como JSONB, solo necesitamos documentar la estructura

-- Esta migración es principalmente documentaria ya que JSONB permite flexibilidad
-- Pero podemos agregar algunas validaciones y valores por defecto

-- Actualizar tenants existentes con configuración de layout por defecto
UPDATE tenants 
SET branding = jsonb_set(
  COALESCE(branding, '{}'::jsonb),
  '{layout}',
  '{
    "containerPadding": "normal",
    "borderRadius": "medium", 
    "glassIntensity": "medium",
    "backgroundColor": "#0F172A",
    "cardColor": "#1E293B",
    "borderColor": "#334155",
    "logoPosition": "left",
    "logoSize": "medium",
    "coverImageOpacity": 0.8,
    "mobileLayout": "stack",
    "responsiveBreakpoints": {
      "mobile": 768,
      "tablet": 1024,
      "desktop": 1280
    }
  }'::jsonb
)
WHERE branding IS NULL OR NOT branding ? 'layout';

-- Agregar comentarios para documentar la estructura
COMMENT ON COLUMN tenants.branding IS 'Configuración de branding del tenant que incluye:
- Colores primarios, secundarios, botones, texto
- URLs de logo y imagen de portada
- Textos personalizados
- Galería de imágenes (array de objetos con url, name, alt, order)
- Tipografía (fuentes, tamaños, interlineado)
- Layout (padding, bordes, glass effects, responsive)';

-- Función para validar estructura de branding (opcional)
CREATE OR REPLACE FUNCTION validate_branding_structure(branding_data jsonb)
RETURNS boolean AS $$
BEGIN
  -- Validar que los colores sean válidos (formato hex)
  IF branding_data ? 'primaryColor' AND NOT (branding_data->>'primaryColor' ~ '^#[0-9A-Fa-f]{6}$') THEN
    RETURN false;
  END IF;
  
  IF branding_data ? 'secondaryColor' AND NOT (branding_data->>'secondaryColor' ~ '^#[0-9A-Fa-f]{6}$') THEN
    RETURN false;
  END IF;
  
  -- Validar estructura de layout si existe
  IF branding_data ? 'layout' THEN
    IF NOT (
      branding_data->'layout' ? 'containerPadding' AND
      branding_data->'layout'->>'containerPadding' IN ('compact', 'normal', 'spacious') AND
      branding_data->'layout' ? 'borderRadius' AND
      branding_data->'layout'->>'borderRadius' IN ('none', 'small', 'medium', 'large')
    ) THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Agregar constraint de validación (opcional, comentado por defecto)
-- ALTER TABLE tenants 
-- ADD CONSTRAINT valid_branding_structure 
-- CHECK (validate_branding_structure(branding));

-- Índices para mejorar rendimiento en consultas de branding
CREATE INDEX IF NOT EXISTS idx_tenants_branding_colors 
ON tenants USING GIN ((branding->'primaryColor'), (branding->'secondaryColor'));

CREATE INDEX IF NOT EXISTS idx_tenants_branding_layout 
ON tenants USING GIN ((branding->'layout'));

-- Vista para obtener configuración completa de branding
CREATE OR REPLACE VIEW tenant_branding_config AS
SELECT 
  id,
  slug,
  name,
  branding->'primaryColor' as primary_color,
  branding->'secondaryColor' as secondary_color,
  branding->'buttonColor' as button_color,
  branding->'textColor' as text_color,
  branding->'logoUrl' as logo_url,
  branding->'coverImageUrl' as cover_image_url,
  branding->'customTitle' as custom_title,
  branding->'customSubtitle' as custom_subtitle,
  branding->'gallery' as gallery,
  branding->'typography' as typography,
  branding->'layout' as layout_config
FROM tenants
WHERE branding IS NOT NULL;

-- Agregar comentario a la vista
COMMENT ON VIEW tenant_branding_config IS 'Vista que extrae la configuración de branding de forma estructurada';