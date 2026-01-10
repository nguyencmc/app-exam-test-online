// Flashcard Module - Barrel Export

// Services
export { flashcardService } from './services/flashcardService';

// Types
export type {
    Flashcard,
    FlashcardSet,
    FlashcardInsert,
    FlashcardUpdate,
    FlashcardSetWithCards,
    FlashcardProgress,
    StudySession,
} from './types/flashcard.types';

// Note: Hooks will be migrated separately
// export { useFlashcardData } from './hooks/useFlashcardData';
// export { useFlashcardStudy } from './hooks/useFlashcardStudy';
// export { useSpacedRepetition } from './hooks/useSpacedRepetition';
