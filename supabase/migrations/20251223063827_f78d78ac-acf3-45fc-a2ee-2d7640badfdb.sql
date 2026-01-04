-- Create study_groups table
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  creator_id UUID NOT NULL,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 50,
  member_count INTEGER DEFAULT 1,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_group_members table
CREATE TABLE public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create study_group_messages table
CREATE TABLE public.study_group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_group_resources table
CREATE TABLE public.study_group_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT DEFAULT 'link' CHECK (resource_type IN ('link', 'file', 'note', 'exam', 'flashcard')),
  resource_url TEXT,
  resource_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_groups
CREATE POLICY "Public groups are viewable by everyone"
ON public.study_groups FOR SELECT
USING (is_public = true OR EXISTS (
  SELECT 1 FROM public.study_group_members 
  WHERE group_id = id AND user_id = auth.uid()
));

CREATE POLICY "Authenticated users can create groups"
ON public.study_groups FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Group owners and admins can update"
ON public.study_groups FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.study_group_members 
  WHERE group_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin')
));

CREATE POLICY "Group owners can delete"
ON public.study_groups FOR DELETE
USING (creator_id = auth.uid());

-- RLS Policies for study_group_members
CREATE POLICY "Members are viewable by group members"
ON public.study_group_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.study_group_members m 
  WHERE m.group_id = group_id AND m.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.study_groups g 
  WHERE g.id = group_id AND g.is_public = true
));

CREATE POLICY "Users can join groups"
ON public.study_group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave groups"
ON public.study_group_members FOR DELETE
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.study_group_members m 
  WHERE m.group_id = group_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin')
));

-- RLS Policies for study_group_messages
CREATE POLICY "Messages viewable by group members"
ON public.study_group_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.study_group_members 
  WHERE group_id = study_group_messages.group_id AND user_id = auth.uid()
));

CREATE POLICY "Members can send messages"
ON public.study_group_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.study_group_members 
  WHERE group_id = study_group_messages.group_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete own messages"
ON public.study_group_messages FOR DELETE
USING (user_id = auth.uid());

-- RLS Policies for study_group_resources
CREATE POLICY "Resources viewable by group members"
ON public.study_group_resources FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.study_group_members 
  WHERE group_id = study_group_resources.group_id AND user_id = auth.uid()
));

CREATE POLICY "Members can share resources"
ON public.study_group_resources FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.study_group_members 
  WHERE group_id = study_group_resources.group_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete own resources"
ON public.study_group_resources FOR DELETE
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_study_groups_updated_at
BEFORE UPDATE ON public.study_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_group_messages;