-- Phase 1: Progress Tracking Dashboard
-- Migration for user goals and daily activity tracking

-- ===========================================
-- 1. User Goals Table
-- ===========================================
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL, -- 'daily_exams', 'weekly_exams', 'daily_questions', 'streak_days'
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own goals"
ON public.user_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.user_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.user_goals FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_user_goals_period ON public.user_goals(user_id, period_start, period_end);

-- ===========================================
-- 2. User Daily Activity Table
-- ===========================================
CREATE TABLE IF NOT EXISTS public.user_daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  exams_completed INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  flashcards_reviewed INTEGER DEFAULT 0,
  podcasts_listened INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Enable RLS
ALTER TABLE public.user_daily_activity ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own activity"
ON public.user_daily_activity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
ON public.user_daily_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
ON public.user_daily_activity FOR UPDATE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_user_daily_activity_user_date ON public.user_daily_activity(user_id, activity_date);

-- ===========================================
-- 3. Add streak columns to profiles
-- ===========================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- ===========================================
-- 4. Function to update daily activity
-- ===========================================
CREATE OR REPLACE FUNCTION public.update_daily_activity(
  p_user_id UUID,
  p_exams_delta INTEGER DEFAULT 0,
  p_questions_delta INTEGER DEFAULT 0,
  p_correct_delta INTEGER DEFAULT 0,
  p_flashcards_delta INTEGER DEFAULT 0,
  p_time_delta INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_last_activity DATE;
  v_current_streak INTEGER;
BEGIN
  -- Upsert daily activity
  INSERT INTO public.user_daily_activity (user_id, activity_date, exams_completed, questions_answered, correct_answers, flashcards_reviewed, time_spent_minutes)
  VALUES (p_user_id, v_today, p_exams_delta, p_questions_delta, p_correct_delta, p_flashcards_delta, p_time_delta)
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET
    exams_completed = user_daily_activity.exams_completed + p_exams_delta,
    questions_answered = user_daily_activity.questions_answered + p_questions_delta,
    correct_answers = user_daily_activity.correct_answers + p_correct_delta,
    flashcards_reviewed = user_daily_activity.flashcards_reviewed + p_flashcards_delta,
    time_spent_minutes = user_daily_activity.time_spent_minutes + p_time_delta,
    updated_at = now();

  -- Update streak
  SELECT last_activity_date, current_streak INTO v_last_activity, v_current_streak
  FROM public.profiles WHERE user_id = p_user_id;

  IF v_last_activity IS NULL OR v_last_activity < v_yesterday THEN
    -- Reset streak or first activity
    v_current_streak := 1;
  ELSIF v_last_activity = v_yesterday THEN
    -- Continue streak
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
  END IF;
  -- If v_last_activity = v_today, streak stays the same

  -- Update profile
  UPDATE public.profiles
  SET 
    current_streak = v_current_streak,
    longest_streak = GREATEST(COALESCE(longest_streak, 0), v_current_streak),
    last_activity_date = v_today
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_daily_activity TO authenticated;
