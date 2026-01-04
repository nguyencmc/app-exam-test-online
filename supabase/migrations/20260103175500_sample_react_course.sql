-- Comprehensive Sample Course Data: ReactJS Mastery
-- Course ID: d0115c5e-8877-4f6c-843d-045a27814988

DO $$
DECLARE
  v_course_id UUID := 'd0115c5e-8877-4f6c-843d-045a27814988';
  v_module1_id UUID;
  v_module2_id UUID;
  v_instructor_id UUID;
BEGIN
  -- 1. Create Instructor (using the first user found or a placeholder if none)
  -- In a real scenario, this would be a specific user. Here we'll just pick one.
  SELECT id INTO v_instructor_id FROM auth.users LIMIT 1;

  -- 2. Clean up if exists
  DELETE FROM public.courses WHERE id = v_course_id;

  -- 3. Insert Course
  INSERT INTO public.courses (
    id, title, description, level, duration_hours, language,
    price, discount_price, thumbnail_url, preview_video_url,
    student_count, rating_avg, rating_count, published, category, subcategory
  ) VALUES (
    v_course_id,
    'Lập trình ReactJS Thực Chiến: Từ Cơ Bản đến Nâng Cao',
    'Khóa học toàn diện về ReactJS, Hooks, Redux Toolkit và Next.js. Xây dựng 3 dự án thực tế để làm đẹp Portfolio của bạn.',
    'intermediate',
    12.5,
    'vi',
    1299000,
    699000,
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    1250,
    4.8,
    342,
    true,
    'languages', -- Using valid category from check constraint/app logic if any, defaulting to languages/english for now or specific code if added
    'english' -- Placeholder subcategory
  );

  -- 4. Insert Requirements
  INSERT INTO public.course_requirements (course_id, requirement_text, order_index) VALUES
    (v_course_id, 'Kiến thức cơ bản về HTML, CSS và JavaScript', 1),
    (v_course_id, 'Hiểu biết về ES6+ (Arrow function, Destructuring, Spread operator)', 2),
    (v_course_id, 'Máy tính cài đặt sẵn Node.js và VS Code', 3);

  -- 5. Insert Outcomes
  INSERT INTO public.course_outcomes (course_id, outcome_text, order_index) VALUES
    (v_course_id, 'Hiểu sâu về Core React: Virtual DOM, Reconciliation, State & Props', 1),
    (v_course_id, 'Làm chủ React Hooks (useState, useEffect, useContext, useReducer)', 2),
    (v_course_id, 'Quản lý State phức tạp với Redux Toolkit', 3),
    (v_course_id, 'Tối ưu hiệu năng ứng dụng React', 4),
    (v_course_id, 'Xây dựng ứng dụng Fullstack với Next.js', 5);

  -- 6. Insert Instructors
  IF v_instructor_id IS NOT NULL THEN
    INSERT INTO public.course_instructors (course_id, user_id, bio, title, is_primary) VALUES
    (v_course_id, v_instructor_id, 'Senior Frontend Engineer tại TechCorp. 5 năm kinh nghiệm giảng dạy.', 'Senior Engineer', true);
  END IF;

  -- 7. Module 1: Foundations
  INSERT INTO public.course_modules (course_id, title, description, order_index, duration_minutes)
  VALUES (v_course_id, 'Chương 1: Nền tảng ReactJS', 'Hiểu rõ cách React hoạt động dưới lóp vỏ', 1, 60)
  RETURNING id INTO v_module1_id;

  -- Lessons for Module 1
  INSERT INTO public.course_lessons (module_id, title, description, type, content_url, duration_minutes, order_index, is_preview) VALUES
    (v_module1_id, 'Giới thiệu khóa học & Lộ trình', 'Tổng quan về những gì bạn sẽ học', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 10, 1, true),
    (v_module1_id, 'React hoạt động như thế nào?', 'Virtual DOM và Reconciliation', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 20, 2, true),
    (v_module1_id, 'Setup dự án với Vite', 'Cài đặt môi trường phát triển hiện đại', 'article', '<h1>Cài đặt Vite</h1><p>Chạy lệnh: npm create vite@latest</p>', 15, 3, false),
    (v_module1_id, 'Quiz: Kiến thức nền tảng', 'Kiểm tra kiến thức chương 1', 'quiz', null, 15, 4, false);

  -- 8. Module 2: Hooks Deep Dive
  INSERT INTO public.course_modules (course_id, title, description, order_index, duration_minutes)
  VALUES (v_course_id, 'Chương 2: React Hooks Chuyên Sâu', 'Làm chủ các Hooks quan trọng nhất', 2, 90)
  RETURNING id INTO v_module2_id;

  -- Lessons for Module 2
  INSERT INTO public.course_lessons (module_id, title, description, type, content_url, duration_minutes, order_index, is_preview) VALUES
    (v_module2_id, 'useState & useEffect Masterclass', 'Hiểu đúng về Lifecycle và Side effects', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 30, 1, false),
    (v_module2_id, 'Custom Hooks', 'Tái sử dụng logic với Custom Hooks', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 25, 2, false),
    (v_module2_id, 'Bài tập: Xây dựng Todo App', 'Áp dụng kiến thức đã học', 'exercise', null, 35, 3, false);

  RAISE NOTICE 'Created ReactJS Mastercourse with ID: %', v_course_id;
END $$;
