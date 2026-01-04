-- Create exam_categories table
CREATE TABLE public.exam_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  exam_count INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  question_count INTEGER DEFAULT 0,
  subcategory_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 5.0,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exam_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Exam categories are viewable by everyone" 
ON public.exam_categories FOR SELECT USING (true);

-- Insert sample exam categories
INSERT INTO public.exam_categories (name, slug, exam_count, attempt_count, question_count, subcategory_count, rating, is_featured, display_order) VALUES
('AWS Certification', 'aws', 160, 920, 10759, 12, 5.0, true, 1),
('TOEIC', 'toeic', 117, 74, 11699, 2, 5.0, true, 2),
('IELTS', 'ielts', 20, 65, 800, 1, 5.0, true, 3),
('Tester Certification', 'tester', 17, 55, 755, 3, 5.0, false, 4),
('HSK', 'hsk', 322, 44, 26430, 6, 5.0, true, 5),
('JLPT', 'jlpt', 46, 33, 3829, 5, 5.0, true, 6),
('TOPIK', 'topik', 20, 23, 1700, 2, 5.0, false, 7),
('Business Analyst', 'ba', 3, 5, 150, 1, 5.0, false, 8),
('PMP', 'pmp', 15, 28, 890, 2, 5.0, false, 9),
('CompTIA', 'comptia', 25, 42, 1500, 4, 5.0, false, 10),
('Cisco', 'cisco', 18, 31, 980, 3, 5.0, false, 11),
('Microsoft Azure', 'azure', 45, 67, 2800, 5, 5.0, true, 12);