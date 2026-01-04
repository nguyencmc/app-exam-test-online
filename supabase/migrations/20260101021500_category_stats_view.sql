-- Create view for category statistics
-- This view calculates real-time stats from related tables

CREATE OR REPLACE VIEW public.category_stats_view AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.icon_url,
  c.rating,
  c.is_featured,
  c.display_order,
  c.subcategory_count,
  c.created_at,
  COALESCE(exam_stats.exam_count, 0) as exam_count,
  COALESCE(exam_stats.question_count, 0) as question_count,
  COALESCE(exam_stats.attempt_count, 0) as attempt_count
FROM exam_categories c
LEFT JOIN (
  SELECT 
    e.category_id,
    COUNT(DISTINCT e.id) as exam_count,
    COUNT(DISTINCT q.id) as question_count,
    COUNT(DISTINCT a.id) as attempt_count
  FROM exams e
  LEFT JOIN questions q ON q.exam_id = e.id
  LEFT JOIN exam_attempts a ON a.exam_id = e.id
  GROUP BY e.category_id
) exam_stats ON exam_stats.category_id = c.id;

-- Grant read access to all users
GRANT SELECT ON public.category_stats_view TO anon, authenticated;

-- Also create a view for exam statistics
CREATE OR REPLACE VIEW public.exam_stats_view AS
SELECT 
  e.id,
  e.category_id,
  e.title,
  e.slug,
  e.description,
  e.duration_minutes,
  e.difficulty,
  e.is_featured,
  e.pass_rate,
  e.created_at,
  e.updated_at,
  COALESCE(COUNT(DISTINCT q.id), 0) as question_count,
  COALESCE(COUNT(DISTINCT a.id), 0) as attempt_count
FROM exams e
LEFT JOIN questions q ON q.exam_id = e.id
LEFT JOIN exam_attempts a ON a.exam_id = e.id
GROUP BY e.id;

-- Grant read access
GRANT SELECT ON public.exam_stats_view TO anon, authenticated;
