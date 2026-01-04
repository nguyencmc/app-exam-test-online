-- Fix RLS Policies to allow Admin/Teacher to manage all courses
-- This migration adds policies for admin and teacher roles

-- ============================================
-- 1. Create helper function to check admin/teacher role
-- ============================================

CREATE OR REPLACE FUNCTION public.is_admin_or_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'teacher')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Update courses table policies
-- ============================================

-- Drop existing update/delete policies
DROP POLICY IF EXISTS "Users can update their own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can delete their own courses" ON public.courses;

-- Create new policies that include admin/teacher check
CREATE POLICY "Users can update their own courses" 
ON public.courses FOR UPDATE 
USING (
  auth.uid() = creator_id 
  OR public.is_admin_or_teacher()
);

CREATE POLICY "Users can delete their own courses" 
ON public.courses FOR DELETE 
USING (
  auth.uid() = creator_id 
  OR public.is_admin_or_teacher()
);

-- ============================================
-- 3. Update course_modules table policies
-- ============================================

-- Drop existing manage policy
DROP POLICY IF EXISTS "Course creators can manage modules" ON public.course_modules;

-- Create new policy with admin/teacher access
CREATE POLICY "Course creators can manage modules"
ON public.course_modules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_modules.course_id
    AND courses.creator_id = auth.uid()
  )
  OR public.is_admin_or_teacher()
);

-- ============================================
-- 4. Update course_lessons table policies
-- ============================================

-- Drop existing manage policy
DROP POLICY IF EXISTS "Course creators can manage lessons" ON public.course_lessons;

-- Create new policy with admin/teacher access
CREATE POLICY "Course creators can manage lessons"
ON public.course_lessons FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.course_modules cm
    JOIN public.courses c ON c.id = cm.course_id
    WHERE cm.id = course_lessons.module_id
    AND c.creator_id = auth.uid()
  )
  OR public.is_admin_or_teacher()
);

-- ============================================
-- 5. Update course_requirements policies
-- ============================================

DROP POLICY IF EXISTS "Course creators can manage requirements" ON public.course_requirements;

CREATE POLICY "Course creators can manage requirements"
ON public.course_requirements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_requirements.course_id
    AND courses.creator_id = auth.uid()
  )
  OR public.is_admin_or_teacher()
);

-- ============================================
-- 6. Update course_outcomes policies
-- ============================================

DROP POLICY IF EXISTS "Course creators can manage outcomes" ON public.course_outcomes;

CREATE POLICY "Course creators can manage outcomes"
ON public.course_outcomes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_outcomes.course_id
    AND courses.creator_id = auth.uid()
  )
  OR public.is_admin_or_teacher()
);

-- ============================================
-- 7. Grant execute to authenticated users
-- ============================================

GRANT EXECUTE ON FUNCTION public.is_admin_or_teacher() TO authenticated;
