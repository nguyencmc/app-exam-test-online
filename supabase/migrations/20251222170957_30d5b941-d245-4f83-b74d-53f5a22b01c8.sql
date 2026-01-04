-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'languages',
  subcategory TEXT,
  topic TEXT,
  term_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name TEXT DEFAULT 'The Best Study',
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses policies - everyone can view
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses FOR SELECT USING (true);

-- Only authenticated users can create courses
CREATE POLICY "Authenticated users can create courses" 
ON public.courses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own courses
CREATE POLICY "Users can update their own courses" 
ON public.courses FOR UPDATE USING (auth.uid() = creator_id);

-- Users can delete their own courses
CREATE POLICY "Users can delete their own courses" 
ON public.courses FOR DELETE USING (auth.uid() = creator_id);

-- Create function to handle new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample courses data
INSERT INTO public.courses (title, description, category, subcategory, term_count, view_count, is_official, creator_name) VALUES
('600 Từ vựng TOEIC cơ bản', 'Bộ từ vựng TOEIC cơ bản giúp bạn đạt 450+ điểm', 'exams', 'toeic', 600, 1523, true, 'The Best Study'),
('IELTS Academic Vocabulary', 'Essential vocabulary for IELTS Academic test', 'exams', 'ielts', 350, 892, true, 'The Best Study'),
('N5 Kanji cho người mới', 'Học 100 Kanji cơ bản cho JLPT N5', 'languages', 'japanese', 100, 2341, true, 'The Best Study'),
('HSK 1 Vocabulary', 'Từ vựng tiếng Trung HSK cấp độ 1', 'exams', 'hsk', 150, 567, true, 'The Best Study'),
('English Grammar Essentials', 'Ngữ pháp tiếng Anh căn bản', 'languages', 'english', 80, 1205, true, 'The Best Study'),
('Tiếng Hàn cho người mới bắt đầu', 'Học tiếng Hàn từ con số 0', 'languages', 'korean', 120, 890, true, 'The Best Study'),
('TOPIK I Vocabulary', 'Từ vựng chuẩn bị cho kỳ thi TOPIK I', 'exams', 'topik', 200, 456, true, 'The Best Study'),
('Tiếng Pháp cơ bản A1', 'Học tiếng Pháp trình độ A1', 'languages', 'french', 150, 234, true, 'The Best Study');