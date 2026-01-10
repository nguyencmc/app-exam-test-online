// Exam Service - Exam Module
// API calls for exam management

import { supabase } from '@/integrations/supabase/client';
import type {
    Exam,
    ExamInsert,
    ExamUpdate,
    Question,
    ExamAttempt,
} from '../types/exam.types';
import type { PaginatedResponse } from '@/shared/types/common.types';

export const examService = {
    /**
     * Get all published exams with pagination
     */
    async getExams(page = 1, pageSize = 10): Promise<PaginatedResponse<Exam>> {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from('exams')
            .select('*, exam_categories(name, slug)')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const { count } = await supabase
            .from('exams')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);

        return {
            data: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
        };
    },

    /**
     * Get all exams for admin (including unpublished)
     */
    async getAdminExams(): Promise<Exam[]> {
        const { data, error } = await supabase
            .from('exams')
            .select('*, exam_categories(name, slug)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get exam by ID or slug
     */
    async getExam(idOrSlug: string): Promise<Exam | null> {
        const { data, error } = await supabase
            .from('exams')
            .select('*, exam_categories(name, slug), questions(*)')
            .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data;
    },

    /**
     * Get exams by category
     */
    async getExamsByCategory(categorySlug: string): Promise<Exam[]> {
        const { data, error } = await supabase
            .from('exams')
            .select('*, exam_categories!inner(name, slug)')
            .eq('exam_categories.slug', categorySlug)
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get questions for an exam
     */
    async getExamQuestions(examId: string): Promise<Question[]> {
        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', examId)
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Create a new exam (admin/teacher only)
     */
    async createExam(exam: ExamInsert): Promise<Exam> {
        const { data, error } = await supabase
            .from('exams')
            .insert(exam)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update an exam (admin/teacher only)
     */
    async updateExam(id: string, exam: ExamUpdate): Promise<Exam> {
        const { data, error } = await supabase
            .from('exams')
            .update(exam)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete an exam (admin only)
     */
    async deleteExam(id: string): Promise<void> {
        const { error } = await supabase
            .from('exams')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Start an exam attempt
     */
    async startAttempt(examId: string, userId: string): Promise<ExamAttempt> {
        const { data, error } = await supabase
            .from('exam_attempts')
            .insert({
                exam_id: examId,
                user_id: userId,
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Complete an exam attempt
     */
    async completeAttempt(
        attemptId: string,
        score: number,
        totalQuestions: number,
        answers: { question_id: string; selected_answer: string; is_correct: boolean }[]
    ): Promise<ExamAttempt> {
        const { error: answersError } = await supabase
            .from('attempt_answers' as any)
            .insert(
                answers.map(a => ({
                    attempt_id: attemptId,
                    question_id: a.question_id,
                    selected_answer: a.selected_answer,
                    is_correct: a.is_correct,
                }))
            );

        if (answersError) throw answersError;

        const { data, error } = await supabase
            .from('exam_attempts')
            .update({
                completed_at: new Date().toISOString(),
                score,
                total_questions: totalQuestions,
            })
            .eq('id', attemptId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get user's exam history
     */
    async getUserAttempts(userId: string): Promise<ExamAttempt[]> {
        const { data, error } = await supabase
            .from('exam_attempts')
            .select('*, exams(title, slug)')
            .eq('user_id', userId)
            .order('started_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Duplicate an exam including its questions
     */
    async duplicateExam(exam: Exam): Promise<Exam> {
        const { data: newExam, error: examError } = await supabase
            .from('exams')
            .insert({
                title: `${exam.title} (Bản sao)`,
                slug: `${exam.slug}-copy-${Date.now()}`,
                description: exam.description,
                difficulty: exam.difficulty,
                duration_minutes: exam.duration_minutes,
                category_id: exam.category_id,
                question_count: 0,
                attempt_count: 0,
                is_published: false
            })
            .select()
            .single();

        if (examError) throw examError;
        if (!newExam) throw new Error('Failed to create new exam');

        const { data: questions } = await supabase
            .from('questions')
            .select('*')
            .eq('exam_id', exam.id);

        if (questions && questions.length > 0) {
            const newQuestions = questions.map(q => ({
                exam_id: newExam.id,
                question_text: q.question_text,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                option_e: q.option_e,
                option_f: q.option_f,
                option_g: q.option_g,
                option_h: q.option_h,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                question_order: q.question_order,
            }));

            const { error: questionsError } = await supabase
                .from('questions')
                .insert(newQuestions);

            if (questionsError) throw questionsError;

            await supabase
                .from('exams')
                .update({ question_count: questions.length })
                .eq('id', newExam.id);
        }

        return newExam;
    },

    /**
     * Delete an exam and its questions
     */
    async deleteExamWithQuestions(id: string): Promise<void> {
        const { error: qError } = await supabase
            .from('questions')
            .delete()
            .eq('exam_id', id);

        if (qError) throw qError;

        const { error: eError } = await supabase
            .from('exams')
            .delete()
            .eq('id', id);

        if (eError) throw eError;
    },
};
