// Flashcard Module Types

import type { Database } from '@/shared/integrations/supabase/types';

// Table row types
export type Flashcard = Database['public']['Tables']['flashcards']['Row'];
export type FlashcardSet = Database['public']['Tables']['flashcard_sets']['Row'];

// Insert/Update types
export type FlashcardInsert = Database['public']['Tables']['flashcards']['Insert'];
export type FlashcardUpdate = Database['public']['Tables']['flashcards']['Update'];

// Helper types
export interface FlashcardSetWithCards extends FlashcardSet {
    flashcards?: Flashcard[];
}

export interface FlashcardProgress {
    flashcard_id: string;
    user_id: string;
    is_remembered: boolean;
    review_count: number;
    last_reviewed_at: string;
    // SM-2 Algorithm fields (for future implementation)
    ease_factor?: number;
    interval?: number;
    next_review?: string;
}

export interface StudySession {
    deckId: string;
    cardsStudied: number;
    correctCount: number;
    startTime: Date;
    endTime?: Date;
}
