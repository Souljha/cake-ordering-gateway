-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name)
VALUES ('product-images', 'product-images')
ON CONFLICT (id) DO NOTHING;

-- Create policies only if they don't exist
DO $$
BEGIN
    -- Check if "Allow anon uploads" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow anon uploads' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        -- Create the policy
        EXECUTE 'CREATE POLICY "Allow anon uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = ''product-images'')';
    END IF;
    
    -- Check if "Allow anon view" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow anon view' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        -- Create the policy
        EXECUTE 'CREATE POLICY "Allow anon view" ON storage.objects FOR SELECT TO anon USING (bucket_id = ''product-images'')';
    END IF;
    
    -- Check if "Allow anon update own files" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow anon update own files' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        -- Create the policy
        EXECUTE 'CREATE POLICY "Allow anon update own files" ON storage.objects FOR UPDATE TO anon USING (bucket_id = ''product-images'')';
    END IF;
    
    -- Check if "Allow anon delete own files" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Allow anon delete own files' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        -- Create the policy
        EXECUTE 'CREATE POLICY "Allow anon delete own files" ON storage.objects FOR DELETE TO anon USING (bucket_id = ''product-images'')';
    END IF;
END $$;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Enable RLS if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;