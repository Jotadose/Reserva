-- Migration: Fase 2 - Galería de Imágenes y Tipografía
-- Descripción: Agrega soporte para galería de imágenes y configuración de tipografía al campo branding

-- Esta migración actualiza el campo branding JSONB para incluir:
-- 1. gallery: Array de objetos con url, name, alt, y order
-- 2. typography: Objeto con configuración de fuentes

-- Actualizar registros existentes con valores por defecto para los nuevos campos
UPDATE tenants 
SET branding = COALESCE(branding, '{}'::jsonb) || jsonb_build_object(
  'gallery', '[]'::jsonb,
  'typography', jsonb_build_object(
    'headingFont', 'inter',
    'bodyFont', 'inter', 
    'buttonFont', 'inter',
    'headingSize', 'large',
    'bodySize', 'medium',
    'lineHeight', 'normal'
  )
)
WHERE branding IS NULL OR 
      NOT (branding ? 'gallery') OR 
      NOT (branding ? 'typography');

-- Comentarios para referencia:
-- 
-- Estructura de gallery:
-- [
--   {
--     "url": "https://...",
--     "name": "Imagen 1",
--     "alt": "Descripción de la imagen",
--     "order": 0
--   }
-- ]
--
-- Estructura de typography:
-- {
--   "headingFont": "inter|roboto|poppins|montserrat|playfair|lora|oswald|dancing-script",
--   "bodyFont": "inter|roboto|poppins|montserrat|playfair|lora|oswald|dancing-script",
--   "buttonFont": "inter|roboto|poppins|montserrat|playfair|lora|oswald|dancing-script",
--   "headingSize": "small|medium|large|xlarge",
--   "bodySize": "small|medium|large",
--   "lineHeight": "tight|normal|relaxed"
-- }