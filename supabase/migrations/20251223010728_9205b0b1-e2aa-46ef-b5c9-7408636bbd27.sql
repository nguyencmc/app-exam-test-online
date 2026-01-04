-- Create book_categories table
CREATE TABLE public.book_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  book_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
CREATE POLICY "Book categories are viewable by everyone" 
ON public.book_categories 
FOR SELECT 
USING (true);

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  author_name TEXT DEFAULT 'The Best Study',
  cover_url TEXT,
  category_id UUID REFERENCES public.book_categories(id),
  page_count INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  difficulty TEXT DEFAULT 'intermediate',
  is_featured BOOLEAN DEFAULT false,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
CREATE POLICY "Books are viewable by everyone" 
ON public.books 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();