// Exam Service - Exam Module
// API calls for exam management (Using Backend API)

import { api } from '@/lib/api';
import type {
    Exam,
    ExamInsert,
    ExamUpdate,
    Question,
    ExamAttempt,
} from '../types/exam.types';
import type { PaginatedResponse } from '@/shared/types/common.types';

interface ApiResponse<T> {
    data: T;
}

interface PaginatedApiResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const examService = {
    /**
     * Get all published exams with pagination
     */
    async getExams(page = 1, pageSize = 10): Promise<PaginatedResponse<Exam>> {
        const response = await api.get<PaginatedApiResponse<Exam>>(
            `/exams?page=${page}&pageSize=${pageSize}`
        );
        return {
            data: response.data,
            total: response.total,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
        };
    },

    /**
     * Get all exams for admin (including unpublished)
     */
    async getAdminExams(): Promise<Exam[]> {
        const response = await api.get<ApiResponse<Exam[]>>('/exams/admin/all');
        return response.data;
    },

    /**
     * Get exam by ID or slug
     */
    async getExam(idOrSlug: string): Promise<Exam | null> {
        try {
            const response = await api.get<ApiResponse<Exam>>(`/exams/${idOrSlug}`);
            return response.data;
        } catch {
            return null;
        }
    },

    /**
     * Get exams by category
     */
    async getExamsByCategory(categorySlug: string): Promise<Exam[]> {
        const response = await api.get<ApiResponse<Exam[]>>(
            `/exams/category/${categorySlug}`
        );
        return response.data;
    },

    /**
     * Get questions for an exam
     */
    async getExamQuestions(examId: string): Promise<Question[]> {
        const exam = await this.getExam(examId);
        return (exam?.questions as Question[]) || [];
    },

    /**
     * Create a new exam (admin/teacher only)
     */
    async createExam(exam: ExamInsert): Promise<Exam> {
        const response = await api.post<ApiResponse<Exam>>('/exams', exam);
        return response.data;
    },

    /**
     * Update an exam (admin/teacher only)
     */
    async updateExam(id: string, exam: ExamUpdate): Promise<Exam> {
        const response = await api.put<ApiResponse<Exam>>(`/exams/${id}`, exam);
        return response.data;
    },

    /**
     * Delete an exam (admin only)
     */
    async deleteExam(id: string): Promise<void> {
        await api.delete(`/exams/${id}`);
    },

    /**
     * Start an exam attempt
     */
    async startAttempt(examId: string, userId: string): Promise<ExamAttempt> {
        const response = await api.post<ApiResponse<ExamAttempt>>('/exams/attempts', {
            examId,
        });
        return response.data;
    },

    /**
     * Complete an exam attempt
     */
    async completeAttempt(
        attemptId: string,
        score: number,
        totalQuestions: number,
        answers: { questionId: string; selectedAnswer: string; isCorrect: boolean }[]
    ): Promise<ExamAttempt> {
        const response = await api.put<ApiResponse<ExamAttempt>>(
            `/exams/attempts/${attemptId}`,
            { score, totalQuestions, answers }
        );
        return response.data;
    },

    /**
     * Get user's exam history
     */
    async getUserAttempts(userId: string): Promise<ExamAttempt[]> {
        const response = await api.get<ApiResponse<ExamAttempt[]>>('/exams/user/attempts');
        return response.data;
    },

    /**
     * Duplicate an exam including its questions
     */
    async duplicateExam(exam: Exam): Promise<Exam> {
        // TODO: Implement when backend supports duplication
        throw new Error('Duplicate exam not yet implemented');
    },

    /**
     * Delete an exam and its questions
     */
    async deleteExamWithQuestions(id: string): Promise<void> {
        // Deleting exam cascades to questions via Prisma schema
        await api.delete(`/exams/${id}`);
    },
};
