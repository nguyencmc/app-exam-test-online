-- Create storage bucket for course videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-videos', 'course-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Admin/Teacher can upload videos
CREATE POLICY "Admin teacher upload course videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-videos'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'teacher')
  )
);

-- Policy: Admin/Teacher can update videos
CREATE POLICY "Admin teacher update course videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-videos'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'teacher')
  )
);

-- Policy: Admin/Teacher can delete videos
CREATE POLICY "Admin teacher delete course videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-videos'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'teacher')
  )
);

-- Policy: Anyone can view videos (public bucket)
CREATE POLICY "Public read course videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-videos');
