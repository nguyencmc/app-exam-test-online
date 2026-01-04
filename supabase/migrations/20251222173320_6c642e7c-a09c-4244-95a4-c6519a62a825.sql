-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  question_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Questions are viewable by everyone" 
ON public.questions 
FOR SELECT 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_questions_exam_id ON public.questions(exam_id);

-- Insert sample questions for each exam
DO $$
DECLARE
  exam_record RECORD;
BEGIN
  FOR exam_record IN SELECT id, title FROM public.exams LOOP
    INSERT INTO public.questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, question_order)
    VALUES 
      (exam_record.id, 'Câu hỏi mẫu 1: Đây là câu hỏi về kiến thức cơ bản?', 'Đáp án A - Đây là lựa chọn đầu tiên', 'Đáp án B - Đây là lựa chọn thứ hai', 'Đáp án C - Đây là lựa chọn thứ ba', 'Đáp án D - Đây là lựa chọn thứ tư', 'A', 'Giải thích: Đáp án A là đúng vì...', 1),
      (exam_record.id, 'Câu hỏi mẫu 2: Trong các phương án sau, đâu là phương án chính xác?', 'Phương án không chính xác', 'Phương án chính xác nhất', 'Phương án gần đúng', 'Phương án hoàn toàn sai', 'B', 'Giải thích: Đáp án B là đúng vì đây là phương án chính xác nhất.', 2),
      (exam_record.id, 'Câu hỏi mẫu 3: Chọn đáp án đúng cho câu hỏi sau?', 'Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3 - Đáp án đúng', 'Lựa chọn 4', 'C', 'Giải thích: Đáp án C là đúng.', 3),
      (exam_record.id, 'Câu hỏi mẫu 4: Đâu là khẳng định chính xác?', 'Khẳng định sai', 'Khẳng định không đầy đủ', 'Khẳng định thiếu logic', 'Khẳng định chính xác', 'D', 'Giải thích: Đáp án D là khẳng định chính xác nhất.', 4),
      (exam_record.id, 'Câu hỏi mẫu 5: Kết quả của phép tính sau là gì?', 'Kết quả đúng', 'Kết quả sai 1', 'Kết quả sai 2', 'Kết quả sai 3', 'A', 'Giải thích: Đáp án A là kết quả đúng của phép tính.', 5);
  END LOOP;
END $$;

-- Create exam_attempts table to store user attempts
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create exam attempts" 
ON public.exam_attempts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own attempts" 
ON public.exam_attempts 
FOR SELECT 
USING (true);