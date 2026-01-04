-- Bảng lưu tiến độ đọc sách của user
CREATE TABLE public.user_book_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  current_position INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Bảng lưu bookmarks
CREATE TABLE public.book_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng lưu highlights
CREATE TABLE public.book_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  start_position INTEGER NOT NULL,
  end_position INTEGER NOT NULL,
  highlighted_text TEXT NOT NULL,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng lưu notes/ghi chú
CREATE TABLE public.book_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bảng lưu chapters/mục lục
CREATE TABLE public.book_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  chapter_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;

-- RLS policies cho user_book_progress
CREATE POLICY "Users can view their own reading progress"
ON public.user_book_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading progress"
ON public.user_book_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress"
ON public.user_book_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress"
ON public.user_book_progress FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies cho book_bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.book_bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.book_bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.book_bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies cho book_highlights
CREATE POLICY "Users can view their own highlights"
ON public.book_highlights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own highlights"
ON public.book_highlights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights"
ON public.book_highlights FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies cho book_notes
CREATE POLICY "Users can view their own notes"
ON public.book_notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
ON public.book_notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.book_notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.book_notes FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies cho book_chapters (public read, admin/teacher write)
CREATE POLICY "Chapters are viewable by everyone"
ON public.book_chapters FOR SELECT
USING (true);

CREATE POLICY "Teachers can manage chapters"
ON public.book_chapters FOR ALL
USING (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger cập nhật updated_at
CREATE TRIGGER update_user_book_progress_updated_at
BEFORE UPDATE ON public.user_book_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_notes_updated_at
BEFORE UPDATE ON public.book_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();