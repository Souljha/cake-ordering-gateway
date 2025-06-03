-- Drop the existing INSERT policy for anonymous users
DROP POLICY IF EXISTS "Allow anon uploads" ON storage.objects;

-- Create a more permissive INSERT policy
CREATE POLICY "Allow anon uploads" 
ON storage.objects 
FOR INSERT 
TO anon
WITH CHECK (
  bucket_id = 'product-images' 
  -- No additional restrictions
);