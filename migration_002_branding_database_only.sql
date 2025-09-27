-- Migration: Add branding support to existing tenants (DATABASE ONLY)
-- Date: 2025-09-27
-- Description: Adds branding column to tenants table for visual customization
-- NOTE: Storage policies must be configured via Supabase Dashboard

-- Add branding column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';

-- Create index for branding column for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_branding ON tenants USING GIN (branding);

-- Update existing tenants with default branding if they don't have any
UPDATE tenants 
SET branding = '{
  "primaryColor": "#8B5CF6",
  "secondaryColor": "#EC4899", 
  "buttonColor": "#10B981",
  "textColor": "#F3F4F6",
  "logoUrl": null,
  "coverImageUrl": null
}'::jsonb
WHERE branding = '{}'::jsonb OR branding IS NULL OR branding->>'textColor' IS NULL;

-- Add comment to track this migration
COMMENT ON COLUMN tenants.branding IS 'Visual branding settings including colors and image URLs';

-- Verification queries (can be run to check the migration)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'branding';
-- SELECT name, branding FROM tenants LIMIT 5;