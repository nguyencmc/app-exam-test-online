-- Sample data for testing the new course system
-- This creates a complete course with modules, lessons, and sample enrollment

DO $$
DECLARE
  v_course_id UUID;
  v_module1_id UUID;
  v_module2_id UUID;
  v_lesson1_id UUID;
  v_lesson2_id UUID;
BEGIN
  -- Update existing course with new fields
  UPDATE public.courses
  SET 
    level = 'beginner',
    duration_hours = 8.5,
    language = 'vi',
    price = 499000,
    discount_price = 299000,
    thumbnail_url = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    preview_video_url = 'https://example.com/preview.mp4',
    published = true,
    last_updated = NOW()
  WHERE title = '600 Từ vựng TOEIC cơ bản'
  RETURNING id INTO v_course_id;

  -- Add course requirements
  INSERT INTO public.course_requirements (course_id, requirement_text, order_index) VALUES
    (v_course_id, 'Hiểu biết cơ bản về tiếng Anh', 1),
    (v_course_id, 'Máy tính hoặc điện thoại có kết nối internet', 2),
    (v_course_id, 'Cam kết dành 30 phút mỗi ngày để học', 3);

  -- Add course outcomes
  INSERT INTO public.course_outcomes (course_id, outcome_text, order_index) VALUES
    (v_course_id, 'Nắm vững 600 từ vựng TOEIC phổ biến nhất', 1),
    (v_course_id, 'Cải thiện điểm TOEIC lên 450+', 2),
    (v_course_id, 'Tự tin giao tiếp trong môi trường công sở', 3),
    (v_course_id, 'Hiểu rõ cách áp dụng từ vựng trong ngữ cảnh thực tế', 4);

  -- Create Module 1
  INSERT INTO public.course_modules (course_id, title, description, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'Phần 1: Business Vocabulary',
    'Học từ vựng cơ bản trong môi trường kinh doanh',
    1,
    120
  ) RETURNING id INTO v_module1_id;

  -- Create lessons for Module 1
  INSERT INTO public.course_lessons (module_id, title, description, type, content_url, duration_minutes, order_index, is_preview)
  VALUES 
    (v_module1_id, 'Giới thiệu khóa học', 'Tổng quan về khóa học và cách học hiệu quả', 'video', 'https://example.com/intro.mp4', 10, 1, true),
    (v_module1_id, 'Office Vocabulary', 'Từ vựng văn phòng cơ bản', 'video', 'https://example.com/lesson1.mp4', 25, 2, false),
    (v_module1_id, 'Meeting Terms', 'Thuật ngữ trong cuộc họp', 'video', 'https://example.com/lesson2.mp4', 30, 3, false),
    (v_module1_id, 'Practice Quiz 1', 'Bài kiểm tra từ vựng phần 1', 'quiz', null, 15, 4, false);

  -- Create Module 2
  INSERT INTO public.course_modules (course_id, title, description, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'Phần 2: Communication & Marketing',
    'Từ vựng về giao tiếp và marketing',
    2,
    150
  ) RETURNING id INTO v_module2_id;

  -- Create lessons for Module 2
  INSERT INTO public.course_lessons (module_id, title, description, type, content_url, duration_minutes, order_index, is_preview)
  VALUES 
    (v_module2_id, 'Email Writing', 'Viết email chuyên nghiệp', 'video', 'https://example.com/lesson3.mp4', 35, 1, false),
    (v_module2_id, 'Phone Conversations', 'Đàm thoại qua điện thoại', 'video', 'https://example.com/lesson4.mp4', 30, 2, false),
    (v_module2_id, 'Marketing Vocabulary', 'Từ vựng marketing cơ bản', 'article', null, 25, 3, false),
    (v_module2_id, 'Final Practice Test', 'Bài kiểm tra tổng hợp', 'quiz', null, 20, 4, false);

  RAISE NOTICE 'Sample course data created successfully for course: %', v_course_id;
END $$;
