import { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { flashcardService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { Flashcard } from "@/types";

type CardStatus = 'known' | 'unknown' | 'unseen';

export const useFlashcardStudy = (cards: Flashcard[] | undefined, userProgress: any[] | undefined) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
    const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
    const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
    const [cardHistory, setCardHistory] = useState<Array<{ cardId: string, action: 'known' | 'unknown' }>>([]);
    const [isRetryMode, setIsRetryMode] = useState(false);
    const [retryCards, setRetryCards] = useState<Flashcard[]>([]);

    // Initialize progress
    useEffect(() => {
        if (userProgress && cards) {
            const known = new Set<string>();
            const unknown = new Set<string>();
            userProgress.forEach((p) => {
                if (p.is_remembered) {
                    known.add(p.flashcard_id);
                } else {
                    unknown.add(p.flashcard_id);
                }
            });
            setKnownCards(known);
            setUnknownCards(unknown);
        }
    }, [userProgress, cards]);

    // Active cards
    const activeCards = isRetryMode ? retryCards : cards || [];
    const currentCard = activeCards[currentIndex];

    // Update progress mutation
    const updateProgressMutation = useMutation({
        mutationFn: async ({ flashcardId, quality }: { flashcardId: string; quality: number }) => {
            if (!user?.id) throw new Error("Not authenticated");
            await flashcardService.updateProgress(user.id, flashcardId, quality);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] });
        },
    });

    const handleMarkCard = (status: 'known' | 'unknown') => {
        if (!activeCards || activeCards.length === 0 || isAnimating) return;

        const card = activeCards[currentIndex];

        // Update local state
        if (status === 'known') {
            setKnownCards(prev => new Set([...prev, card.id]));
            setUnknownCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(card.id);
                return newSet;
            });
        } else {
            setUnknownCards(prev => new Set([...prev, card.id]));
            setKnownCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(card.id);
                return newSet;
            });
        }

        setCardHistory(prev => [...prev, { cardId: card.id, action: status }]);

        // Persist
        if (user) {
            // Map status to SM-2 quality: Known = 4 (hard/good), Unknown = 1 (wrong)
            updateProgressMutation.mutate({
                flashcardId: card.id,
                quality: status === 'known' ? 4 : 1
            });
        }

        // Animate next
        if (currentIndex < activeCards.length - 1) {
            setSlideDirection(status === 'known' ? "right" : "left");
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setIsFlipped(false);
                setIsAnimating(false);
                setSlideDirection(null);
            }, 250);
        } else {
            // End of deck
            // In a real app we might trigger a completion modal
            console.log("Deck completed");
        }
    };

    const handleUndo = () => {
        if (cardHistory.length === 0 || isAnimating) return;

        const lastAction = cardHistory[cardHistory.length - 1];

        if (lastAction.action === 'known') {
            setKnownCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(lastAction.cardId);
                return newSet;
            });
        } else {
            setUnknownCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(lastAction.cardId);
                return newSet;
            });
        }

        setCardHistory(prev => prev.slice(0, -1));

        if (currentIndex > 0) {
            setSlideDirection("right");
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex(prev => prev - 1);
                setIsFlipped(false);
                setIsAnimating(false);
                setSlideDirection(null);
            }, 200);
        }
    };

    const startRetryMode = () => {
        if (!cards) return;
        const cardsToRetry = cards.filter(card => unknownCards.has(card.id));
        if (cardsToRetry.length === 0) return;

        setRetryCards(cardsToRetry);
        setIsRetryMode(true);
        setCurrentIndex(0);
        setIsFlipped(false);
        setCardHistory([]);
    };

    const exitRetryMode = () => {
        setIsRetryMode(false);
        setRetryCards([]);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const resetAllCards = () => {
        setKnownCards(new Set());
        setUnknownCards(new Set());
        setCardHistory([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsRetryMode(false);
        setRetryCards([]);
    };

    return {
        // State
        currentIndex,
        currentCard,
        activeCards,
        isFlipped,
        setIsFlipped,
        isAnimating,
        slideDirection,
        knownCards,
        unknownCards,
        isRetryMode,
        retryCards,
        cardHistory, // Exposed for checking length

        // Actions
        handleMarkCard,
        handleUndo,
        startRetryMode,
        exitRetryMode,
        resetAllCards,
    };
};
