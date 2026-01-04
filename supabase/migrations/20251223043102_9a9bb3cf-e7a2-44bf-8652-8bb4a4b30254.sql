-- Cập nhật RLS policies cho exams - cho phép teacher tạo/sửa/xóa
CREATE POLICY "Teachers can create exams" 
ON public.exams 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update exams" 
ON public.exams 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete exams" 
ON public.exams 
FOR DELETE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Cập nhật RLS policies cho exam_categories
CREATE POLICY "Teachers can create exam categories" 
ON public.exam_categories 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update exam categories" 
ON public.exam_categories 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete exam categories" 
ON public.exam_categories 
FOR DELETE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Cập nhật RLS policies cho questions
CREATE POLICY "Teachers can create questions" 
ON public.questions 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update questions" 
ON public.questions 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete questions" 
ON public.questions 
FOR DELETE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Cập nhật RLS policies cho flashcard_sets - học sinh cũng có thể tạo
DROP POLICY IF EXISTS "Public flashcard sets are viewable by everyone" ON public.flashcard_sets;
CREATE POLICY "Users can view public or own sets" 
ON public.flashcard_sets 
FOR SELECT 
USING ((is_public = true) OR (auth.uid() = creator_id));

-- Cập nhật RLS policies cho flashcards
CREATE POLICY "Authenticated users can create flashcards" 
ON public.flashcards 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update flashcards" 
ON public.flashcards 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete flashcards" 
ON public.flashcards 
FOR DELETE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Cập nhật RLS policies cho podcasts
CREATE POLICY "Teachers can create podcasts" 
ON public.podcasts 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update podcasts" 
ON public.podcasts 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete podcasts" 
ON public.podcasts 
FOR DELETE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Cập nhật RLS policies cho podcast_categories
CREATE POLICY "Teachers can create podcast categories" 
ON public.podcast_categories 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update podcast categories" 
ON public.podcast_categories 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete podcast categories" 
ON public.podcast_categories 
FOR DELETE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Cập nhật RLS policies cho books
CREATE POLICY "Teachers can create books" 
ON public.books 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update books" 
ON public.books 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete books" 
ON public.books 
FOR DELETE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Cập nhật RLS policies cho book_categories
CREATE POLICY "Teachers can create book categories" 
ON public.book_categories 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update book categories" 
ON public.book_categories 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete book categories" 
ON public.book_categories 
FOR DELETE 
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));