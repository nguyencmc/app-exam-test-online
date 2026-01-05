-- Create storage bucket for books if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload files to books bucket
CREATE POLICY "Allow authenticated uploads to books"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'books');

-- Allow public read access to books bucket
CREATE POLICY "Allow public read access to books"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'books');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates to books"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'books');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes from books"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'books');
