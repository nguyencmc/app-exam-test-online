-- Thêm role 'teacher' vào enum app_role
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'teacher';