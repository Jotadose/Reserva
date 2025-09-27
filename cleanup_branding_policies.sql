-- CLEANUP SCRIPT: Remove existing branding policies (if needed)
-- Run this ONLY if you need to start fresh with storage policies

-- Drop existing policies
DROP POLICY IF EXISTS "Tenant members can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant members can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant members can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Tenant members can delete assets" ON storage.objects;

-- Optionally, also remove the bucket (CAREFUL: This will delete all images!)
-- DELETE FROM storage.objects WHERE bucket_id = 'tenant-assets';
-- DELETE FROM storage.buckets WHERE id = 'tenant-assets';

-- Check what policies exist for storage.objects
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%Tenant%';

COMMIT;