-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'general',
  requirement_type TEXT NOT NULL, -- 'exams_completed', 'perfect_score', 'streak_days', 'questions_answered', 'points_earned', 'flashcards_mastered'
  requirement_value INTEGER NOT NULL DEFAULT 1,
  points_reward INTEGER NOT NULL DEFAULT 10,
  badge_color TEXT NOT NULL DEFAULT 'gold',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (public read)
CREATE POLICY "Achievements are viewable by everyone"
ON public.achievements FOR SELECT
USING (true);

CREATE POLICY "Admins can manage achievements"
ON public.achievements FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS policies for user_achievements
CREATE POLICY "Users can view all user achievements"
ON public.user_achievements FOR SELECT
USING (true);

CREATE POLICY "System can insert user achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, points_reward, badge_color, display_order) VALUES
-- Exam achievements
('Người mới bắt đầu', 'Hoàn thành bài thi đầu tiên', '🎯', 'exam', 'exams_completed', 1, 10, 'bronze', 1),
('Học sinh chăm chỉ', 'Hoàn thành 10 bài thi', '📚', 'exam', 'exams_completed', 10, 50, 'silver', 2),
('Chiến binh kiến thức', 'Hoàn thành 50 bài thi', '⚔️', 'exam', 'exams_completed', 50, 200, 'gold', 3),
('Bậc thầy thi cử', 'Hoàn thành 100 bài thi', '👑', 'exam', 'exams_completed', 100, 500, 'platinum', 4),

-- Perfect score achievements
('Điểm hoàn hảo', 'Đạt 100% trong một bài thi', '💯', 'exam', 'perfect_score', 1, 25, 'gold', 5),
('Thiên tài', 'Đạt 100% trong 5 bài thi', '🧠', 'exam', 'perfect_score', 5, 100, 'platinum', 6),

-- Streak achievements
('3 ngày liên tiếp', 'Học 3 ngày liên tiếp', '🔥', 'streak', 'streak_days', 3, 15, 'bronze', 7),
('Tuần lễ cần cù', 'Học 7 ngày liên tiếp', '🌟', 'streak', 'streak_days', 7, 50, 'silver', 8),
('Tháng kỷ luật', 'Học 30 ngày liên tiếp', '🏅', 'streak', 'streak_days', 30, 300, 'gold', 9),

-- Questions answered
('100 câu hỏi', 'Trả lời 100 câu hỏi', '✍️', 'questions', 'questions_answered', 100, 30, 'bronze', 10),
('500 câu hỏi', 'Trả lời 500 câu hỏi', '📝', 'questions', 'questions_answered', 500, 100, 'silver', 11),
('1000 câu hỏi', 'Trả lời 1000 câu hỏi', '🎓', 'questions', 'questions_answered', 1000, 300, 'gold', 12),

-- Points achievements
('100 điểm', 'Đạt 100 điểm tích lũy', '⭐', 'points', 'points_earned', 100, 10, 'bronze', 13),
('500 điểm', 'Đạt 500 điểm tích lũy', '🌙', 'points', 'points_earned', 500, 25, 'silver', 14),
('1000 điểm', 'Đạt 1000 điểm tích lũy', '☀️', 'points', 'points_earned', 1000, 50, 'gold', 15),

-- Flashcard achievements
('Nhớ 10 thẻ', 'Nhớ 10 flashcards', '🃏', 'flashcard', 'flashcards_mastered', 10, 20, 'bronze', 16),
('Nhớ 50 thẻ', 'Nhớ 50 flashcards', '🎴', 'flashcard', 'flashcards_mastered', 50, 75, 'silver', 17),
('Nhớ 100 thẻ', 'Nhớ 100 flashcards', '🎪', 'flashcard', 'flashcards_mastered', 100, 150, 'gold', 18);