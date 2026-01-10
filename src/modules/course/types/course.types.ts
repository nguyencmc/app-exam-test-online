// Course Module Types

import type { Database } from '@/shared/integrations/supabase/types';

// Table row types
export type Course = Database['public']['Tables']['courses']['Row'];

// Insert/Update types
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];

// Custom types for course structure
export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    type: 'video' | 'article' | 'quiz' | 'exercise';
    content_url: string | null;
    duration_minutes: number;
    order_index: number;
    is_preview: boolean;
    resources?: any;
}

export interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    order_index: number;
    duration_minutes: number;
    lessons: Lesson[];
}

export interface CourseDetail extends Course {
    modules: CourseModule[];
    requirements: Array<{ requirement_text: string }>;
    outcomes: Array<{ outcome_text: string }>;
    instructors: Array<{
        user_id: string;
        bio: string | null;
        title: string | null;
        is_primary: boolean;
    }>;
    rating_avg: number;
    rating_count: number;
    student_count: number;
    preview_video_url?: string | null;
}

export interface CourseEnrollment {
    id: string;
    user_id: string;
    course_id: string;
    progress_percent: number;
    enrolled_at: string;
    completed_at: string | null;
}
