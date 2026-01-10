import { useQuery } from "@tanstack/react-query";
import { flashcardService } from "@/modules/flashcard";
import { useAuth } from "@/modules/auth";
import { FlashcardSet, Flashcard } from "@/types";

export const useFlashcardData = (selectedSetId?: string) => {
    const { user } = useAuth();

    // Fetch flashcard sets
    const { data: sets, isLoading: setsLoading } = useQuery({
        queryKey: ["flashcard-sets"],
        queryFn: async () => {
            // We'll use the service but currently service uses pagination
            // For now, let's fetch first 100 sets to behave similarly to original
            const result = await flashcardService.getDecks(1, 100);
            return result.data as unknown as FlashcardSet[];
            // Note: Service returns FlashcardDeck (snake_case from DB) which matches FlashcardSet interface roughly
            // We might need to map if types are strictly different, but usually Supabase types align.
        },
    });

    // Fetch flashcards for selected set
    const { data: cards, isLoading: cardsLoading } = useQuery({
        queryKey: ["flashcards", selectedSetId],
        queryFn: async () => {
            if (!selectedSetId) return [];
            return await flashcardService.getFlashcards(selectedSetId);
        },
        enabled: !!selectedSetId,
    });

    // Fetch user progress
    const { data: userProgress, isLoading: progressLoading } = useQuery({
        queryKey: ["flashcard-progress", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            return await flashcardService.getUserProgress(user.id);
        },
        enabled: !!user,
    });

    return {
        sets,
        setsLoading,
        cards,
        cardsLoading,
        userProgress,
        progressLoading,
    };
};
