-- Phase 2: Spaced Repetition Flashcards
-- Add SM-2 algorithm fields to user_flashcard_progress

-- ===========================================
-- 1. Add SM-2 fields to user_flashcard_progress
-- ===========================================
ALTER TABLE public.user_flashcard_progress 
ADD COLUMN IF NOT EXISTS easiness_factor DECIMAL(4,2) DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_review_date DATE,
ADD COLUMN IF NOT EXISTS quality_response INTEGER; -- 0-5 scale (0=blackout, 5=perfect)

-- Update existing records with default values
UPDATE public.user_flashcard_progress 
SET 
  easiness_factor = COALESCE(easiness_factor, 2.5),
  interval_days = COALESCE(interval_days, 1),
  repetitions = COALESCE(repetitions, 0),
  next_review_date = COALESCE(next_review_date, CURRENT_DATE)
WHERE easiness_factor IS NULL;

-- ===========================================
-- 2. Create index for due cards query
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_next_review 
ON public.user_flashcard_progress(user_id, next_review_date);

-- ===========================================
-- 3. Create view for cards due for review
-- ===========================================
CREATE OR REPLACE VIEW public.flashcards_due_for_review AS
SELECT 
  fp.id,
  fp.user_id,
  fp.flashcard_id,
  fp.easiness_factor,
  fp.interval_days,
  fp.repetitions,
  fp.next_review_date,
  fp.last_reviewed_at,
  f.front_text,
  f.back_text,
  f.set_id,
  fs.title as set_title
FROM public.user_flashcard_progress fp
JOIN public.flashcards f ON f.id = fp.flashcard_id
JOIN public.flashcard_sets fs ON fs.id = f.set_id
WHERE fp.next_review_date <= CURRENT_DATE
ORDER BY fp.next_review_date ASC;

-- Grant access
GRANT SELECT ON public.flashcards_due_for_review TO authenticated;

-- ===========================================
-- 4. Function to calculate SM-2 algorithm
-- ===========================================
CREATE OR REPLACE FUNCTION public.calculate_sm2(
  p_user_id UUID,
  p_flashcard_id UUID,
  p_quality INTEGER -- 0-5 quality response
)
RETURNS TABLE (
  new_easiness_factor DECIMAL(4,2),
  new_interval_days INTEGER,
  new_repetitions INTEGER,
  new_next_review_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ef DECIMAL(4,2);
  v_interval INTEGER;
  v_reps INTEGER;
  v_new_ef DECIMAL(4,2);
  v_new_interval INTEGER;
  v_new_reps INTEGER;
BEGIN
  -- Get current values
  SELECT easiness_factor, interval_days, repetitions
  INTO v_ef, v_interval, v_reps
  FROM public.user_flashcard_progress
  WHERE user_id = p_user_id AND flashcard_id = p_flashcard_id;

  -- Default values if not found
  v_ef := COALESCE(v_ef, 2.5);
  v_interval := COALESCE(v_interval, 1);
  v_reps := COALESCE(v_reps, 0);

  -- SM-2 Algorithm
  -- Calculate new easiness factor
  v_new_ef := v_ef + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02));
  
  -- Minimum EF is 1.3
  IF v_new_ef < 1.3 THEN
    v_new_ef := 1.3;
  END IF;

  -- Calculate new interval and repetitions based on quality
  IF p_quality < 3 THEN
    -- Failed to recall: reset
    v_new_reps := 0;
    v_new_interval := 1;
  ELSE
    -- Successful recall
    v_new_reps := v_reps + 1;
    
    IF v_new_reps = 1 THEN
      v_new_interval := 1;
    ELSIF v_new_reps = 2 THEN
      v_new_interval := 6;
    ELSE
      v_new_interval := ROUND(v_interval * v_new_ef);
    END IF;
  END IF;

  -- Update the record
  INSERT INTO public.user_flashcard_progress (
    user_id, flashcard_id, easiness_factor, interval_days, 
    repetitions, next_review_date, quality_response, 
    last_reviewed_at, review_count, is_remembered
  )
  VALUES (
    p_user_id, p_flashcard_id, v_new_ef, v_new_interval,
    v_new_reps, CURRENT_DATE + v_new_interval, p_quality,
    NOW(), 1, p_quality >= 3
  )
  ON CONFLICT (user_id, flashcard_id)
  DO UPDATE SET
    easiness_factor = v_new_ef,
    interval_days = v_new_interval,
    repetitions = v_new_reps,
    next_review_date = CURRENT_DATE + v_new_interval,
    quality_response = p_quality,
    last_reviewed_at = NOW(),
    review_count = user_flashcard_progress.review_count + 1,
    is_remembered = p_quality >= 3;

  -- Return new values
  RETURN QUERY SELECT v_new_ef, v_new_interval, v_new_reps, (CURRENT_DATE + v_new_interval)::DATE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.calculate_sm2 TO authenticated;

-- ===========================================
-- 5. Function to get review stats
-- ===========================================
CREATE OR REPLACE FUNCTION public.get_flashcard_review_stats(p_user_id UUID)
RETURNS TABLE (
  total_cards BIGINT,
  cards_due_today BIGINT,
  cards_learned BIGINT,
  average_ef DECIMAL(4,2)
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COUNT(*)::BIGINT as total_cards,
    COUNT(CASE WHEN next_review_date <= CURRENT_DATE THEN 1 END)::BIGINT as cards_due_today,
    COUNT(CASE WHEN repetitions >= 2 THEN 1 END)::BIGINT as cards_learned,
    COALESCE(AVG(easiness_factor), 2.5)::DECIMAL(4,2) as average_ef
  FROM public.user_flashcard_progress
  WHERE user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_flashcard_review_stats TO authenticated;
