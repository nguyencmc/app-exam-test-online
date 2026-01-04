-- Create podcast_categories table
CREATE TABLE public.podcast_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  podcast_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create podcasts table
CREATE TABLE public.podcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.podcast_categories(id),
  thumbnail_url TEXT,
  audio_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  episode_number INTEGER DEFAULT 1,
  host_name TEXT DEFAULT 'The Best Study',
  listen_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  difficulty TEXT DEFAULT 'intermediate',
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcast_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Podcast categories are viewable by everyone"
ON public.podcast_categories FOR SELECT
USING (true);

CREATE POLICY "Podcasts are viewable by everyone"
ON public.podcasts FOR SELECT
USING (true);

-- Insert sample categories
INSERT INTO public.podcast_categories (name, slug, description, podcast_count, is_featured, display_order)
VALUES 
  ('TOEIC Listening', 'toeic-listening', 'Luyện nghe TOEIC với các bài podcast chất lượng', 5, true, 1),
  ('IELTS Listening', 'ielts-listening', 'Cải thiện kỹ năng nghe IELTS', 4, true, 2),
  ('English Conversations', 'english-conversations', 'Hội thoại tiếng Anh thực tế hàng ngày', 6, false, 3),
  ('Business English', 'business-english', 'Tiếng Anh thương mại và công sở', 3, false, 4);

-- Insert sample podcasts for TOEIC Listening
INSERT INTO public.podcasts (title, slug, description, category_id, duration_seconds, episode_number, listen_count, is_featured, difficulty)
SELECT 
  title, slug, description,
  (SELECT id FROM public.podcast_categories WHERE slug = 'toeic-listening' LIMIT 1),
  duration_seconds, episode_number, listen_count, is_featured, difficulty
FROM (VALUES
  ('TOEIC Listening Part 1 - Photographs', 'toeic-part1-photos', 'Hướng dẫn chiến lược làm bài Part 1 với các mô tả hình ảnh', 1200, 1, 1520, true, 'beginner'),
  ('TOEIC Listening Part 2 - Question Response', 'toeic-part2-questions', 'Kỹ thuật trả lời câu hỏi ngắn trong Part 2', 1500, 2, 1280, false, 'intermediate'),
  ('TOEIC Listening Part 3 - Conversations', 'toeic-part3-conversations', 'Nghe hiểu đoạn hội thoại dài trong môi trường công sở', 1800, 3, 980, false, 'intermediate'),
  ('TOEIC Listening Part 4 - Talks', 'toeic-part4-talks', 'Luyện nghe các bài thuyết trình và thông báo', 1650, 4, 850, false, 'advanced'),
  ('TOEIC Full Listening Practice Test', 'toeic-full-test', 'Bài thi thử đầy đủ phần Listening với giải thích chi tiết', 2700, 5, 2100, true, 'intermediate')
) AS t(title, slug, description, duration_seconds, episode_number, listen_count, is_featured, difficulty);

-- Insert sample podcasts for IELTS Listening
INSERT INTO public.podcasts (title, slug, description, category_id, duration_seconds, episode_number, listen_count, is_featured, difficulty)
SELECT 
  title, slug, description,
  (SELECT id FROM public.podcast_categories WHERE slug = 'ielts-listening' LIMIT 1),
  duration_seconds, episode_number, listen_count, is_featured, difficulty
FROM (VALUES
  ('IELTS Listening Section 1 - Everyday Conversations', 'ielts-section1', 'Hội thoại hàng ngày - đặt phòng, hỏi đường', 1400, 1, 1350, true, 'beginner'),
  ('IELTS Listening Section 2 - Monologues', 'ielts-section2', 'Nghe bài nói độc thoại về chủ đề xã hội', 1600, 2, 1100, false, 'intermediate'),
  ('IELTS Listening Section 3 - Academic Discussions', 'ielts-section3', 'Thảo luận học thuật giữa sinh viên và giảng viên', 1800, 3, 920, false, 'advanced'),
  ('IELTS Listening Section 4 - Lectures', 'ielts-section4', 'Bài giảng học thuật với từ vựng chuyên ngành', 2000, 4, 780, false, 'advanced')
) AS t(title, slug, description, duration_seconds, episode_number, listen_count, is_featured, difficulty);