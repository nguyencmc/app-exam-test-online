import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SM2Result {
    newEF: number;
    newInterval: number;
    newRepetitions: number;
    nextReviewDate: Date;
}

interface ReviewStats {
    totalCards: number;
    cardsDueToday: number;
    cardsLearned: number;
    averageEF: number;
}

interface FlashcardWithProgress {
    id: string;
    flashcard_id: string;
    front_text: string;
    back_text: string;
    set_id: string;
    set_title: string;
    easiness_factor: number;
    interval_days: number;
    repetitions: number;
    next_review_date: string;
}

/**
 * SM-2 Algorithm Implementation
 * 
 * Quality scale:
 * 0 - Complete blackout, no memory at all
 * 1 - Wrong answer, but remembered upon seeing correct
 * 2 - Wrong answer, but easy to recall after hint
 * 3 - Correct answer with serious difficulty
 * 4 - Correct answer with some hesitation
 * 5 - Perfect response, instant recall
 */
export const calculateSM2 = (
    quality: number,
    oldEF: number,
    repetitions: number,
    interval: number
): SM2Result => {
    // Calculate new easiness factor
    let newEF = oldEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // EF should never be less than 1.3
    newEF = Math.max(1.3, newEF);

    let newInterval: number;
    let newRepetitions: number;

    if (quality < 3) {
        // Failed to recall - reset
        newRepetitions = 0;
        newInterval = 1;
    } else {
        // Successful recall
        newRepetitions = repetitions + 1;

        if (newRepetitions === 1) {
            newInterval = 1;
        } else if (newRepetitions === 2) {
            newInterval = 6;
        } else {
            newInterval = Math.round(interval * newEF);
        }
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
        newEF,
        newInterval,
        newRepetitions,
        nextReviewDate,
    };
};

export const useSpacedRepetition = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [dueCards, setDueCards] = useState<FlashcardWithProgress[]>([]);
    const [stats, setStats] = useState<ReviewStats>({
        totalCards: 0,
        cardsDueToday: 0,
        cardsLearned: 0,
        averageEF: 2.5,
    });

    // Fetch cards due for review
    const fetchDueCards = useCallback(async (setId?: string) => {
        if (!user) return;

        setLoading(true);

        try {
            let query = supabase
                .from('flashcards_due_for_review')
                .select('*')
                .eq('user_id', user.id);

            if (setId) {
                query = query.eq('set_id', setId);
            }

            const { data, error } = await query.limit(50);

            if (error) {
                console.error('Error fetching due cards:', error);
            } else {
                setDueCards(data || []);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch review statistics
    const fetchStats = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase.rpc('get_flashcard_review_stats', {
                p_user_id: user.id,
            });

            if (error) {
                console.error('Error fetching stats:', error);
            } else if (data && data.length > 0) {
                setStats({
                    totalCards: data[0].total_cards || 0,
                    cardsDueToday: data[0].cards_due_today || 0,
                    cardsLearned: data[0].cards_learned || 0,
                    averageEF: data[0].average_ef || 2.5,
                });
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }, [user]);

    // Rate a flashcard (0-5 quality)
    const rateCard = useCallback(async (flashcardId: string, quality: number) => {
        if (!user) return null;

        try {
            // Call the database function
            const { data, error } = await supabase.rpc('calculate_sm2', {
                p_user_id: user.id,
                p_flashcard_id: flashcardId,
                p_quality: quality,
            });

            if (error) {
                console.error('Error rating card:', error);
                return null;
            }

            // Remove the rated card from due cards
            setDueCards(prev => prev.filter(c => c.flashcard_id !== flashcardId));

            // Refresh stats
            fetchStats();

            return data?.[0] || null;
        } catch (err) {
            console.error('Error:', err);
            return null;
        }
    }, [user, fetchStats]);

    // Get all cards for a set with their progress
    const getCardsWithProgress = useCallback(async (setId: string) => {
        if (!user) return [];

        try {
            // First get all flashcards in the set
            const { data: cards, error: cardsError } = await supabase
                .from('flashcards')
                .select('*')
                .eq('set_id', setId)
                .order('card_order', { ascending: true });

            if (cardsError) {
                console.error('Error fetching cards:', cardsError);
                return [];
            }

            // Get progress for these cards
            const { data: progress, error: progressError } = await supabase
                .from('user_flashcard_progress')
                .select('*')
                .eq('user_id', user.id)
                .in('flashcard_id', cards?.map(c => c.id) || []);

            if (progressError) {
                console.error('Error fetching progress:', progressError);
            }

            // Merge cards with progress
            return cards?.map(card => {
                const cardProgress = progress?.find(p => p.flashcard_id === card.id);
                return {
                    ...card,
                    easiness_factor: cardProgress?.easiness_factor || 2.5,
                    interval_days: cardProgress?.interval_days || 1,
                    repetitions: cardProgress?.repetitions || 0,
                    next_review_date: cardProgress?.next_review_date || new Date().toISOString().split('T')[0],
                    is_due: !cardProgress?.next_review_date ||
                        new Date(cardProgress.next_review_date) <= new Date(),
                };
            }) || [];
        } catch (err) {
            console.error('Error:', err);
            return [];
        }
    }, [user]);

    // Quality rating descriptions
    const qualityDescriptions = [
        { value: 0, label: 'Không nhớ', description: 'Hoàn toàn quên', color: 'text-red-600' },
        { value: 1, label: 'Sai', description: 'Nhớ khi thấy đáp án', color: 'text-red-500' },
        { value: 2, label: 'Khó', description: 'Nhớ sau gợi ý', color: 'text-orange-500' },
        { value: 3, label: 'Đúng', description: 'Nhớ khó khăn', color: 'text-yellow-600' },
        { value: 4, label: 'Tốt', description: 'Nhớ dễ dàng', color: 'text-green-500' },
        { value: 5, label: 'Hoàn hảo', description: 'Nhớ ngay lập tức', color: 'text-green-600' },
    ];

    return {
        loading,
        dueCards,
        stats,
        fetchDueCards,
        fetchStats,
        rateCard,
        getCardsWithProgress,
        calculateSM2,
        qualityDescriptions,
    };
};
