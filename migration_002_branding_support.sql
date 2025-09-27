-- Migration: Add branding support to existing tenants
-- Date: 2025-09-26
-- Description: Adds branding column to tenants table for visual customization

-- Add branding column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}';

-- Create index for branding column for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_branding ON tenants USING GIN (branding);

-- Add storage bucket for tenant assets (logos, cover images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their tenant folder
CREATE POLICY "Tenant members can upload assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tenant-assets' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Allow if user is owner/admin of the tenant (using tenant_memberships)
    (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      JOIN tenant_memberships tm ON t.id = tm.tenant_id 
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin')
    )
    OR
    -- Fallback: allow if user is the owner of the tenant (legacy support)
    (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      WHERE t.owner_id = auth.uid()
    )
  )
);

-- Allow authenticated users to view their tenant assets
CREATE POLICY "Tenant members can view assets" ON storage.objects
FOR SELECT USING (
  bucket_id = 'tenant-assets' 
  AND (
    -- Public access for viewing
    TRUE
    OR
    -- Or member access for management
    (auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      JOIN tenant_memberships tm ON t.id = tm.tenant_id 
      WHERE tm.user_id = auth.uid()
    ))
  )
);

-- Allow tenant members to update their assets
CREATE POLICY "Tenant members can update assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'tenant-assets' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Allow if user is owner/admin of the tenant (using tenant_memberships)
    (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      JOIN tenant_memberships tm ON t.id = tm.tenant_id 
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin')
    )
    OR
    -- Fallback: allow if user is the owner of the tenant (legacy support)
    (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      WHERE t.owner_id = auth.uid()
    )
  )
);

-- Allow tenant members to delete their assets
CREATE POLICY "Tenant members can delete assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tenant-assets' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Allow if user is owner/admin of the tenant (using tenant_memberships)
    (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      JOIN tenant_memberships tm ON t.id = tm.tenant_id 
      WHERE tm.user_id = auth.uid() 
      AND tm.role IN ('owner', 'admin')
    )
    OR
    -- Fallback: allow if user is the owner of the tenant (legacy support)
    (storage.foldername(name))[1] IN (
      SELECT t.id::text 
      FROM tenants t 
      WHERE t.owner_id = auth.uid()
    )
  )
);

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
WHERE branding = '{}'::jsonb OR branding IS NULL;

-- Add comment to track this migration
COMMENT ON COLUMN tenants.branding IS 'Visual branding settings including colors and image URLs';