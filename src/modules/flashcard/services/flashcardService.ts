// Flashcard Service - Flashcard Module
// API calls for flashcard management (Using Backend API)

import { api } from '@/lib/api';
import type {
    Flashcard,
    FlashcardSet,
    FlashcardInsert,
    FlashcardUpdate,
    FlashcardSetWithCards
} from '../types/flashcard.types';
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

export const flashcardService = {
    async getDecks(page = 1, pageSize = 10): Promise<PaginatedResponse<FlashcardSet>> {
        const response = await api.get<PaginatedApiResponse<FlashcardSet>>(
            `/flashcards?page=${page}&pageSize=${pageSize}`
        );
        return {
            data: response.data,
            total: response.total,
            page: response.page,
            pageSize: response.pageSize,
            totalPages: response.totalPages,
        };
    },

    async getDeck(id: string): Promise<FlashcardSetWithCards | null> {
        try {
            const response = await api.get<ApiResponse<FlashcardSetWithCards>>(`/flashcards/${id}`);
            return response.data;
        } catch {
            return null;
        }
    },

    async getFlashcards(setId: string): Promise<Flashcard[]> {
        const deck = await this.getDeck(setId);
        return deck?.flashcards || [];
    },

    async createFlashcard(flashcard: FlashcardInsert): Promise<Flashcard> {
        const response = await api.post<ApiResponse<Flashcard>>('/flashcards', flashcard);
        return response.data;
    },

    async updateFlashcard(id: string, flashcard: FlashcardUpdate): Promise<Flashcard> {
        const response = await api.put<ApiResponse<Flashcard>>(`/flashcards/${id}`, flashcard);
        return response.data;
    },

    async deleteFlashcard(id: string): Promise<void> {
        await api.delete(`/flashcards/${id}`);
    },

    async getDueFlashcards(userId: string): Promise<Flashcard[]> {
        // TODO: Implement when backend supports due flashcards
        return [];
    },

    async updateProgress(userId: string, flashcardId: string, quality: number): Promise<void> {
        await api.post('/flashcards/progress', { flashcardId, quality });
    },

    async getUserProgress(userId: string): Promise<any[]> {
        // TODO: Implement when backend supports user progress
        return [];
    },
};
