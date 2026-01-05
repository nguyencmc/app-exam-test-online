// Shared TypeScript types and interfaces

import type { Database } from '@/integrations/supabase/types';

// Table row types from Supabase
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Exam = Database['public']['Tables']['exams']['Row'];
export type ExamCategory = Database['public']['Tables']['exam_categories']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type ExamAttempt = Database['public']['Tables']['exam_attempts']['Row'];
export type Flashcard = Database['public']['Tables']['flashcards']['Row'];
export type FlashcardSet = Database['public']['Tables']['flashcard_sets']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Podcast = Database['public']['Tables']['podcasts']['Row'];
export type PodcastCategory = Database['public']['Tables']['podcast_categories']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];
export type StudyGroup = Database['public']['Tables']['study_groups']['Row'];
export type StudyGroupMember = Database['public']['Tables']['study_group_members']['Row'];
export type Book = Database['public']['Tables']['books']['Row'];
export type BookCategory = Database['public']['Tables']['book_categories']['Row'];

// App role type
export type AppRole = Database['public']['Enums']['app_role'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ExamInsert = Database['public']['Tables']['exams']['Insert'];
export type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
export type FlashcardInsert = Database['public']['Tables']['flashcards']['Insert'];
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];

// Update types  
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type ExamUpdate = Database['public']['Tables']['exams']['Update'];
export type QuestionUpdate = Database['public']['Tables']['questions']['Update'];
export type FlashcardUpdate = Database['public']['Tables']['flashcards']['Update'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];

// Custom Course Types (Manual definitions as they might be missing/complex in generated types)
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
    rating_avg: any; // Override/fix type mismatch if needed, usually number
    rating_count: number;
    student_count: any; // Override/fix type mismatch if needed, usually number
    preview_video_url?: string | null;
}


// Custom types
export interface PaginationParams {
    page: number;
    pageSize: number;
    search?: string;
    filters?: Record<string, any>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}

export interface SelectOption {
    label: string;
    value: string;
}

// Helper type for frontend components
export interface QuestionWithOptions extends Question {
    // Helper property for frontend use, not in DB
    options_list?: string[];
}

export interface ExamWithQuestions extends Exam {
    questions?: Question[];
    category?: ExamCategory;
}

export interface FlashcardSetWithCards extends FlashcardSet {
    flashcards?: Flashcard[];
}

export interface UserProgress {
    totalExams: number;
    completedExams: number;
    averageScore: number;
    totalStudyTime: number;
    currentStreak: number;
}
