-- Add expires_at column to profiles for user expiration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for faster expiration queries
CREATE INDEX IF NOT EXISTS idx_profiles_expires_at ON public.profiles(expires_at);

-- Create a function to check if user is expired
CREATE OR REPLACE FUNCTION public.is_user_expired(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
  )
$$;