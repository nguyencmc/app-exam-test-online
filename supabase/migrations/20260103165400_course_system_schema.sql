-- Udemy-style Course System Database Schema
-- This migration creates a complete course management system

-- ============================================
-- 1. Update existing courses table with new fields
-- ============================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'vi',
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS preview_video_url TEXT,
  ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_avg DECIMAL(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- ============================================
-- 2. Course Instructors Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  title TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_course_instructors_course ON public.course_instructors(course_id);
CREATE INDEX idx_course_instructors_user ON public.course_instructors(user_id);

-- ============================================
-- 3. Course Modules Table (Chapters/Sections)
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_modules_course ON public.course_modules(course_id);
CREATE INDEX idx_course_modules_order ON public.course_modules(course_id, order_index);

-- ============================================
-- 4. Course Lessons Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'article', 'quiz', 'exercise')),
  content_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_lessons_module ON public.course_lessons(module_id);
CREATE INDEX idx_course_lessons_order ON public.course_lessons(module_id, order_index);

-- ============================================
-- 5. Course Enrollments Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_enrollments_user ON public.course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.course_enrollments(course_id);

-- ============================================
-- 6. Lesson Progress Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_enrollment ON public.lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);

-- ============================================
-- 7. Course Reviews Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_course_reviews_course ON public.course_reviews(course_id);
CREATE INDEX idx_course_reviews_user ON public.course_reviews(user_id);
CREATE INDEX idx_course_reviews_rating ON public.course_reviews(course_id, rating);

-- ============================================
-- 8. Course Requirements Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  requirement_text TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_requirements_course ON public.course_requirements(course_id);

-- ============================================
-- 9. Course Outcomes Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.course_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  outcome_text TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_outcomes_course ON public.course_outcomes(course_id);

-- ============================================
-- 10. Row Level Security Policies
-- ============================================

-- Course Instructors
ALTER TABLE public.course_instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view instructors"
  ON public.course_instructors FOR SELECT
  USING (true);

CREATE POLICY "Instructors can update their profile"
  ON public.course_instructors FOR UPDATE
  USING (auth.uid() = user_id);

-- Course Modules
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view modules"
  ON public.course_modules FOR SELECT
  USING (true);

CREATE POLICY "Course creators can manage modules"
  ON public.course_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_modules.course_id
      AND courses.creator_id = auth.uid()
    )
  );

-- Course Lessons
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view preview lessons"
  ON public.course_lessons FOR SELECT
  USING (is_preview = true);

CREATE POLICY "Enrolled students can view lessons"
  ON public.course_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_modules cm
      JOIN public.course_enrollments ce ON ce.course_id = cm.course_id
      WHERE cm.id = course_lessons.module_id
      AND ce.user_id = auth.uid()
    )
  );

CREATE POLICY "Course creators can manage lessons"
  ON public.course_lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.course_modules cm
      JOIN public.courses c ON c.id = cm.course_id
      WHERE cm.id = course_lessons.module_id
      AND c.creator_id = auth.uid()
    )
  );

-- Course Enrollments
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their enrollments"
  ON public.course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Lesson Progress
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their progress"
  ON public.lesson_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_enrollments.id = lesson_progress.enrollment_id
      AND course_enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their progress"
  ON public.lesson_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_enrollments.id = lesson_progress.enrollment_id
      AND course_enrollments.user_id = auth.uid()
    )
  );

-- Course Reviews
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.course_reviews FOR SELECT
  USING (true);

CREATE POLICY "Enrolled users can create reviews"
  ON public.course_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_enrollments.course_id = course_reviews.course_id
      AND course_enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their reviews"
  ON public.course_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their reviews"
  ON public.course_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Course Requirements & Outcomes
ALTER TABLE public.course_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_outcomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view requirements"
  ON public.course_requirements FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view outcomes"
  ON public.course_outcomes FOR SELECT
  USING (true);

CREATE POLICY "Course creators can manage requirements"
  ON public.course_requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_requirements.course_id
      AND courses.creator_id = auth.uid()
    )
  );

CREATE POLICY "Course creators can manage outcomes"
  ON public.course_outcomes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE courses.id = course_outcomes.course_id
      AND courses.creator_id = auth.uid()
    )
  );

-- ============================================
-- 11. Triggers for automatic timestamp updates
-- ============================================

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_reviews_updated_at
  BEFORE UPDATE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 12. Functions for calculating course stats
-- ============================================

-- Function to update course rating average
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.courses
  SET 
    rating_avg = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.course_reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.course_reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER course_review_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- Function to update student count
CREATE OR REPLACE FUNCTION update_student_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.courses
  SET student_count = (
    SELECT COUNT(*)
    FROM public.course_enrollments
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
  )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollment_count_trigger
  AFTER INSERT OR DELETE ON public.course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_student_count();

-- ============================================
-- 13. Comments for documentation
-- ============================================

COMMENT ON TABLE public.course_modules IS 'Chapters or sections within a course';
COMMENT ON TABLE public.course_lessons IS 'Individual lessons within modules - can be video, article, quiz, etc';
COMMENT ON TABLE public.course_enrollments IS 'Tracks which users are enrolled in which courses';
COMMENT ON TABLE public.lesson_progress IS 'Tracks completion status and time spent on each lesson';
COMMENT ON TABLE public.course_reviews IS 'Student reviews and ratings for courses';
COMMENT ON TABLE public.course_instructors IS 'Maps instructors to courses';
COMMENT ON TABLE public.course_requirements IS 'Prerequisites or requirements for taking a course';
COMMENT ON TABLE public.course_outcomes IS 'What students will learn from the course';
