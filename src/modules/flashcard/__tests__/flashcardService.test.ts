// Unit Tests for Flashcard Service

import { describe, it, expect, vi, beforeEach } from "vitest";
import { flashcardService } from "../services/flashcardService";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn(),
        })),
    },
}));

describe("flashcardService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getDecks", () => {
        it("should fetch paginated flashcard sets", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const mockDecks = [
                { id: "1", name: "Deck 1", is_public: true },
                { id: "2", name: "Deck 2", is_public: true },
            ];

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            range: vi.fn().mockResolvedValue({ data: mockDecks, count: 10, error: null }),
                        }),
                    }),
                }),
            } as any);

            const result = await flashcardService.getDecks(1, 10);

            expect(result.data).toEqual(mockDecks);
            expect(result.page).toBe(1);
        });
    });

    describe("getDeck", () => {
        it("should fetch a deck with flashcards", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const mockDeck = {
                id: "1",
                name: "Test Deck",
                flashcards: [
                    { id: "f1", front: "Q1", back: "A1" },
                    { id: "f2", front: "Q2", back: "A2" },
                ],
            };

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: mockDeck, error: null }),
                    }),
                }),
            } as any);

            const result = await flashcardService.getDeck("1");

            expect(result).toEqual(mockDeck);
        });

        it("should return null for non-existent deck", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: null,
                            error: { code: "PGRST116" }
                        }),
                    }),
                }),
            } as any);

            const result = await flashcardService.getDeck("non-existent");

            expect(result).toBeNull();
        });
    });

    describe("createFlashcard", () => {
        it("should create a new flashcard", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const newCard = {
                set_id: "set-1",
                front: "Question",
                back: "Answer",
            };

            const createdCard = { id: "card-123", ...newCard };

            vi.mocked(supabase.from).mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: createdCard, error: null }),
                    }),
                }),
            } as any);

            const result = await flashcardService.createFlashcard(newCard as any);

            expect(result).toEqual(createdCard);
        });
    });

    describe("deleteFlashcard", () => {
        it("should delete a flashcard", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            vi.mocked(supabase.from).mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            } as any);

            await expect(flashcardService.deleteFlashcard("123")).resolves.not.toThrow();
        });
    });
});
