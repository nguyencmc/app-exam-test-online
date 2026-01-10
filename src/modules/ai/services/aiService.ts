// AI Service - Handles all AI-related Edge Function calls

import { supabase } from '@/integrations/supabase/client';
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
    /**
     * Generate quiz questions from content using AI
     */
    async generateQuestions(request: GenerateQuestionsRequest): Promise<GenerateQuestionsResponse> {
        const { data, error } = await supabase.functions.invoke('generate-questions', {
            body: {
                content: request.content,
                questionCount: request.questionCount || 5,
                difficulty: request.difficulty || 'medium',
            },
        });

        if (error) {
            console.error('Generate questions error:', error);
            return { questions: [], error: error.message };
        }

        return data as GenerateQuestionsResponse;
    },

    /**
     * Get AI explanation for an answer
     */
    async explainAnswer(request: ExplainAnswerRequest): Promise<ExplainAnswerResponse> {
        const { data, error } = await supabase.functions.invoke('explain-answer', {
            body: request,
        });

        if (error) {
            console.error('Explain answer error:', error);
            return { explanation: '', error: error.message };
        }

        return data as ExplainAnswerResponse;
    },

    /**
     * Chat with AI tutor
     */
    async chatWithTutor(request: AITutorRequest): Promise<AITutorResponse> {
        const { data, error } = await supabase.functions.invoke('ai-tutor', {
            body: request,
        });

        if (error) {
            console.error('AI Tutor error:', error);
            return { message: '', error: error.message };
        }

        return data as AITutorResponse;
    },

    /**
     * Get smart recommendations for the user
     */
    async getRecommendations(userId: string): Promise<SmartRecommendationsResponse> {
        const { data, error } = await supabase.functions.invoke('smart-recommendations', {
            body: { userId },
        });

        if (error) {
            console.error('Recommendations error:', error);
            return { recommendations: [], error: error.message };
        }

        return data as SmartRecommendationsResponse;
    },
};
