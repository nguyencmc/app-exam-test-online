// Flashcard Service - Flashcard Module
// API calls for flashcard management

import { supabase } from '@/integrations/supabase/client';
import type {
    Flashcard,
    FlashcardSet,
    FlashcardInsert,
    FlashcardUpdate,
    FlashcardSetWithCards
} from '../types/flashcard.types';
import type { PaginatedResponse } from '@/shared/types/common.types';

export const flashcardService = {
    /**
     * Get all flashcard sets with pagination
     */
    async getDecks(page = 1, pageSize = 10): Promise<PaginatedResponse<FlashcardSet>> {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, error, count } = await supabase
            .from('flashcard_sets')
            .select('*', { count: 'exact' })
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return {
            data: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize),
        };
    },

    /**
     * Get set by ID with flashcards
     */
    async getDeck(id: string): Promise<FlashcardSetWithCards | null> {
        const { data, error } = await supabase
            .from('flashcard_sets')
            .select('*, flashcards(*)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data as FlashcardSetWithCards;
    },

    /**
     * Get flashcards for a set
     */
    async getFlashcards(setId: string): Promise<Flashcard[]> {
        const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('set_id', setId)
            .order('card_order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Create a new flashcard
     */
    async createFlashcard(flashcard: FlashcardInsert): Promise<Flashcard> {
        const { data, error } = await supabase
            .from('flashcards')
            .insert(flashcard)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update a flashcard
     */
    async updateFlashcard(id: string, flashcard: FlashcardUpdate): Promise<Flashcard> {
        const { data, error } = await supabase
            .from('flashcards')
            .update(flashcard)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a flashcard
     */
    async deleteFlashcard(id: string): Promise<void> {
        const { error } = await supabase
            .from('flashcards')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Get flashcards due for review
     */
    async getDueFlashcards(userId: string): Promise<Flashcard[]> {
        const { data, error } = await supabase
            .from('user_flashcard_progress')
            .select('flashcard_id, flashcards(*)')
            .eq('user_id', userId)
            .eq('is_remembered', false)
            .limit(20);

        if (error) throw error;
        return (data?.map(p => p.flashcards).filter(Boolean) || []) as Flashcard[];
    },

    /**
     * Update flashcard progress
     */
    async updateProgress(userId: string, flashcardId: string, quality: number): Promise<void> {
        const isRemembered = quality >= 3;

        const { data: current } = await supabase
            .from('user_flashcard_progress')
            .select('review_count')
            .eq('user_id', userId)
            .eq('flashcard_id', flashcardId)
            .single();

        const reviewCount = (current?.review_count || 0) + 1;

        const { error } = await supabase
            .from('user_flashcard_progress')
            .upsert({
                user_id: userId,
                flashcard_id: flashcardId,
                is_remembered: isRemembered,
                review_count: reviewCount,
                last_reviewed_at: new Date().toISOString(),
            }, { onConflict: 'user_id,flashcard_id' });

        if (error) throw error;
    },

    /**
     * Get all user progress
     */
    async getUserProgress(userId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('user_flashcard_progress')
            .select('flashcard_id, is_remembered, last_reviewed_at')
            .eq('user_id', userId);

        if (error) throw error;
        return data || [];
    },
};
