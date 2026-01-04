-- Add username column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_exams_taken integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_correct_answers integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_questions_answered integer DEFAULT 0;

-- Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create leaderboard view (as a function for flexibility)
CREATE OR REPLACE FUNCTION public.get_leaderboard(limit_count integer DEFAULT 100)
RETURNS TABLE (
    user_id uuid,
    username text,
    full_name text,
    avatar_url text,
    points integer,
    level integer,
    total_exams_taken integer,
    total_correct_answers integer,
    rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.points,
    p.level,
    p.total_exams_taken,
    p.total_correct_answers,
    ROW_NUMBER() OVER (ORDER BY p.points DESC, p.total_correct_answers DESC) as rank
  FROM public.profiles p
  WHERE p.username IS NOT NULL
  ORDER BY p.points DESC, p.total_correct_answers DESC
  LIMIT limit_count
$$;

-- Function to update user stats after exam attempt
CREATE OR REPLACE FUNCTION public.update_user_exam_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_exams_taken = total_exams_taken + 1,
    total_correct_answers = total_correct_answers + NEW.correct_answers,
    total_questions_answered = total_questions_answered + NEW.total_questions,
    points = points + (NEW.correct_answers * 10),
    level = GREATEST(1, FLOOR((points + (NEW.correct_answers * 10)) / 100) + 1)::integer
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create trigger for updating stats on exam attempt
DROP TRIGGER IF EXISTS update_stats_on_exam_attempt ON public.exam_attempts;
CREATE TRIGGER update_stats_on_exam_attempt
AFTER INSERT ON public.exam_attempts
FOR EACH ROW
WHEN (NEW.user_id IS NOT NULL)
EXECUTE FUNCTION public.update_user_exam_stats();