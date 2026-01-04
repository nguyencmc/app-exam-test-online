-- Thêm các cột option_e, option_f, option_g, option_h vào bảng questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS option_e text,
ADD COLUMN IF NOT EXISTS option_f text,
ADD COLUMN IF NOT EXISTS option_g text,
ADD COLUMN IF NOT EXISTS option_h text;