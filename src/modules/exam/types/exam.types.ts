// Exam Module Types

import type { Database } from '@/shared/integrations/supabase/types';

// Table row types
export type Exam = Database['public']['Tables']['exams']['Row'];
export type ExamCategory = Database['public']['Tables']['exam_categories']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type ExamAttempt = Database['public']['Tables']['exam_attempts']['Row'];

// Insert types
export type ExamInsert = Database['public']['Tables']['exams']['Insert'];
export type QuestionInsert = Database['public']['Tables']['questions']['Insert'];

// Update types
export type ExamUpdate = Database['public']['Tables']['exams']['Update'];
export type QuestionUpdate = Database['public']['Tables']['questions']['Update'];

// Helper types
export interface QuestionWithOptions extends Question {
    options_list?: string[];
}

export interface ExamWithQuestions extends Exam {
    questions?: Question[];
    category?: ExamCategory;
}

export interface ExamAttemptWithDetails extends ExamAttempt {
    exam?: Exam;
    answers?: ExamAnswer[];
}

export interface ExamAnswer {
    question_id: string;
    selected_answer: string;
    is_correct: boolean;
}
