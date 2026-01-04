-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.exam_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  question_count INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 60,
  attempt_count INTEGER DEFAULT 0,
  pass_rate NUMERIC DEFAULT 0,
  difficulty TEXT DEFAULT 'medium',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Exams are viewable by everyone" 
ON public.exams 
FOR SELECT 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_exams_category_id ON public.exams(category_id);
CREATE INDEX idx_exams_slug ON public.exams(slug);

-- Add trigger for updated_at
CREATE TRIGGER update_exams_updated_at
BEFORE UPDATE ON public.exams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample exams
INSERT INTO public.exams (category_id, title, slug, description, question_count, duration_minutes, attempt_count, pass_rate, difficulty, is_featured)
SELECT 
  ec.id,
  'Đề thi ' || ec.name || ' - Đề số 1',
  ec.slug || '-de-1',
  'Đề thi thử ' || ec.name || ' với các câu hỏi cơ bản',
  50,
  60,
  1250,
  75.5,
  'easy',
  true
FROM public.exam_categories ec;

INSERT INTO public.exams (category_id, title, slug, description, question_count, duration_minutes, attempt_count, pass_rate, difficulty)
SELECT 
  ec.id,
  'Đề thi ' || ec.name || ' - Đề số 2',
  ec.slug || '-de-2',
  'Đề thi thử ' || ec.name || ' nâng cao',
  60,
  90,
  850,
  68.2,
  'medium'
FROM public.exam_categories ec;

INSERT INTO public.exams (category_id, title, slug, description, question_count, duration_minutes, attempt_count, pass_rate, difficulty)
SELECT 
  ec.id,
  'Đề thi ' || ec.name || ' - Đề số 3',
  ec.slug || '-de-3',
  'Đề thi thử ' || ec.name || ' chuyên sâu',
  40,
  45,
  620,
  62.8,
  'hard'
FROM public.exam_categories ec;