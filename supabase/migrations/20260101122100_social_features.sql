-- Phase 3: Social Features
-- Migration for referrals and study group messaging

-- ===========================================
-- 1. Add referral code to profiles
-- ===========================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS referral_points INTEGER DEFAULT 0;

-- Generate referral codes for existing users
UPDATE public.profiles 
SET referral_code = UPPER(SUBSTRING(MD5(user_id::TEXT || RANDOM()::TEXT) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- ===========================================
-- 2. Referrals tracking table
-- ===========================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, expired
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own referrals"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (auth.uid() = referrer_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

-- ===========================================
-- 3. Study group messages table
-- ===========================================
CREATE TABLE IF NOT EXISTS public.study_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- text, image, exam_result, achievement
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;

-- Policies: Only group members can read/write messages
CREATE POLICY "Group members can view messages"
ON public.study_group_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.study_group_members sgm
    WHERE sgm.group_id = study_group_messages.group_id
    AND sgm.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can send messages"
ON public.study_group_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.study_group_members sgm
    WHERE sgm.group_id = study_group_messages.group_id
    AND sgm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.study_group_messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.study_group_messages FOR DELETE
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_group ON public.study_group_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.study_group_messages(user_id);

-- ===========================================
-- 4. Exam result shares table
-- ===========================================
CREATE TABLE IF NOT EXISTS public.exam_result_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type TEXT NOT NULL, -- 'public_link', 'social', 'group'
  share_token TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.exam_result_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their shares"
ON public.exam_result_shares FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public shares"
ON public.exam_result_shares FOR SELECT
USING (share_type = 'public_link' AND (expires_at IS NULL OR expires_at > now()));

-- Index
CREATE INDEX IF NOT EXISTS idx_shares_token ON public.exam_result_shares(share_token);

-- ===========================================
-- 5. Function to generate referral code
-- ===========================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.user_id::TEXT || RANDOM()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code
DROP TRIGGER IF EXISTS trigger_generate_referral_code ON public.profiles;
CREATE TRIGGER trigger_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- ===========================================
-- 6. Function to process referral
-- ===========================================
CREATE OR REPLACE FUNCTION public.process_referral(
  p_referral_code TEXT,
  p_new_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_points INTEGER := 100; -- Points awarded for successful referral
BEGIN
  -- Find the referrer
  SELECT user_id INTO v_referrer_id
  FROM public.profiles
  WHERE referral_code = UPPER(p_referral_code);

  IF v_referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Can't refer yourself
  IF v_referrer_id = p_new_user_id THEN
    RETURN FALSE;
  END IF;

  -- Create referral record
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, points_awarded, completed_at)
  VALUES (v_referrer_id, p_new_user_id, UPPER(p_referral_code), 'completed', v_points, NOW());

  -- Update referrer's points
  UPDATE public.profiles
  SET 
    referral_points = COALESCE(referral_points, 0) + v_points,
    points = COALESCE(points, 0) + v_points
  WHERE user_id = v_referrer_id;

  -- Update referred user's profile
  UPDATE public.profiles
  SET referred_by = v_referrer_id
  WHERE user_id = p_new_user_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_referral TO authenticated;

-- ===========================================
-- 7. Enable Realtime for messages
-- ===========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_messages;
