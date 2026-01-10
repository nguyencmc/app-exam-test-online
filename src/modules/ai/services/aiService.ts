// AI Service - Handles AI-related API calls (Using Backend API)
// Note: AI features require backend Edge Functions or external AI services

import { api } from '@/lib/api';
import type {
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    ExplainAnswerRequest,
    ExplainAnswerResponse,
    AITutorRequest,
    AITutorResponse,
    SmartRecommendationsResponse,
} from '../types/ai.types';

export const aiService = {
    async generateQuestions(request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
        try {
            const response = await api.post<GenerateQuestionsResponse>('/ai/generate-questions', request);
            return response;
        } catch (error) {
            console.error('Generate questions error:', error);
            return { questions: [], error: (error as Error).message };
        }
    },

    async explainAnswer(request: ExplainAnswerRequest): Promise<ExplainAnswerResponse> {
        try {
            const response = await api.post<ExplainAnswerResponse>('/ai/explain-answer', request);
            return response;
        } catch (error) {
            console.error('Explain answer error:', error);
            return { explanation: '', error: (error as Error).message };
        }
    },

    async chatWithTutor(request: AITutorRequest): Promise<AITutorResponse> {
        try {
            const response = await api.post<AITutorResponse>('/ai/tutor', request);
            return response;
        } catch (error) {
            console.error('AI Tutor error:', error);
            return { message: '', error: (error as Error).message };
        }
    },

    async getRecommendations(userId: string): Promise<SmartRecommendationsResponse> {
        try {
            const response = await api.post<SmartRecommendationsResponse>('/ai/recommendations', { userId });
            return response;
        } catch (error) {
            console.error('Recommendations error:', error);
            return { recommendations: [], error: (error as Error).message };
        }
    },
};
