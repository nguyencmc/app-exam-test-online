-- Create flashcard_sets table
CREATE TABLE public.flashcard_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  creator_id UUID,
  card_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID REFERENCES public.flashcard_sets(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  card_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_flashcard_progress table to track remembered cards
CREATE TABLE public.user_flashcard_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
  is_remembered BOOLEAN DEFAULT false,
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, flashcard_id)
);

-- Enable RLS
ALTER TABLE public.flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for flashcard_sets
CREATE POLICY "Public flashcard sets are viewable by everyone"
ON public.flashcard_sets FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create flashcard sets"
ON public.flashcard_sets FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own sets"
ON public.flashcard_sets FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own sets"
ON public.flashcard_sets FOR DELETE
USING (auth.uid() = creator_id);

-- RLS policies for flashcards
CREATE POLICY "Flashcards are viewable by everyone"
ON public.flashcards FOR SELECT
USING (true);

-- RLS policies for user_flashcard_progress
CREATE POLICY "Users can view their own progress"
ON public.user_flashcard_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_flashcard_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_flashcard_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Insert sample data
INSERT INTO public.flashcard_sets (title, description, category, card_count, is_public)
VALUES 
  ('TOEIC Vocabulary - Business', 'Từ vựng TOEIC chủ đề kinh doanh', 'toeic', 10, true),
  ('IELTS Academic Words', 'Từ vựng học thuật IELTS', 'ielts', 10, true);

-- Insert sample flashcards for TOEIC set
INSERT INTO public.flashcards (set_id, front_text, back_text, card_order)
SELECT 
  (SELECT id FROM public.flashcard_sets WHERE title = 'TOEIC Vocabulary - Business' LIMIT 1),
  front_text,
  back_text,
  card_order
FROM (VALUES
  ('Revenue', 'Doanh thu - Tổng số tiền thu được từ hoạt động kinh doanh', 1),
  ('Expenditure', 'Chi tiêu - Số tiền bỏ ra để mua hàng hóa hoặc dịch vụ', 2),
  ('Negotiation', 'Đàm phán - Quá trình thảo luận để đạt được thỏa thuận', 3),
  ('Deadline', 'Hạn chót - Thời điểm cuối cùng phải hoàn thành công việc', 4),
  ('Conference', 'Hội nghị - Cuộc họp lớn để thảo luận về một chủ đề', 5),
  ('Collaborate', 'Hợp tác - Làm việc cùng nhau để đạt mục tiêu chung', 6),
  ('Stakeholder', 'Bên liên quan - Người có lợi ích trong một tổ chức', 7),
  ('Proposal', 'Đề xuất - Kế hoạch hoặc ý tưởng được đưa ra để xem xét', 8),
  ('Inventory', 'Hàng tồn kho - Hàng hóa được lưu trữ để bán', 9),
  ('Audit', 'Kiểm toán - Kiểm tra độc lập các báo cáo tài chính', 10)
) AS t(front_text, back_text, card_order);

-- Insert sample flashcards for IELTS set
INSERT INTO public.flashcards (set_id, front_text, back_text, card_order)
SELECT 
  (SELECT id FROM public.flashcard_sets WHERE title = 'IELTS Academic Words' LIMIT 1),
  front_text,
  back_text,
  card_order
FROM (VALUES
  ('Phenomenon', 'Hiện tượng - Sự kiện hoặc tình huống có thể quan sát được', 1),
  ('Hypothesis', 'Giả thuyết - Lời giải thích được đề xuất dựa trên bằng chứng hạn chế', 2),
  ('Methodology', 'Phương pháp luận - Hệ thống các phương pháp được sử dụng trong nghiên cứu', 3),
  ('Paradigm', 'Mô hình - Khuôn mẫu điển hình hoặc ví dụ về một cái gì đó', 4),
  ('Empirical', 'Thực nghiệm - Dựa trên quan sát hoặc thí nghiệm', 5),
  ('Comprehensive', 'Toàn diện - Bao gồm tất cả các yếu tố liên quan', 6),
  ('Substantial', 'Đáng kể - Có tầm quan trọng hoặc quy mô lớn', 7),
  ('Inherent', 'Vốn có - Tồn tại như một phần tự nhiên của một cái gì đó', 8),
  ('Ambiguous', 'Mơ hồ - Có thể hiểu theo nhiều cách khác nhau', 9),
  ('Prevalent', 'Phổ biến - Tồn tại rộng rãi trong một khu vực hoặc thời điểm cụ thể', 10)
) AS t(front_text, back_text, card_order);