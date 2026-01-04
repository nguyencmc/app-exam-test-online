-- Create storage bucket for exam question images
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload question images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'question-images' 
  AND auth.uid() IS NOT NULL
);

-- Allow everyone to view question images (public bucket)
CREATE POLICY "Question images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'question-images');

-- Allow teachers/admins to delete question images
CREATE POLICY "Teachers can delete question images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'question-images' 
  AND (
    has_role(auth.uid(), 'teacher'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Allow teachers/admins to update question images
CREATE POLICY "Teachers can update question images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'question-images' 
  AND (
    has_role(auth.uid(), 'teacher'::app_role) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);