// Unit Tests for Exam Service

import { describe, it, expect, vi, beforeEach } from "vitest";
import { examService } from "../services/examService";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            single: vi.fn(),
        })),
    },
}));

describe("examService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getExams", () => {
        it("should fetch paginated exams", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const mockExams = [
                { id: "1", title: "Exam 1", is_published: true },
                { id: "2", title: "Exam 2", is_published: true },
            ];

            // First call for data, second call for count
            vi.mocked(supabase.from).mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            range: vi.fn().mockResolvedValue({ data: mockExams, error: null }),
                        }),
                    }),
                }),
            } as any).mockReturnValueOnce({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ count: 10 }),
                }),
            } as any);

            const result = await examService.getExams(1, 10);

            expect(result.data).toEqual(mockExams);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(10);
        });

        it("should throw error when fetch fails", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const mockError = { message: "Database error" };
            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        order: vi.fn().mockReturnValue({
                            range: vi.fn().mockResolvedValue({ data: null, error: mockError }),
                        }),
                    }),
                }),
            } as any);

            await expect(examService.getExams()).rejects.toEqual(mockError);
        });
    });

    describe("getAdminExams", () => {
        it("should fetch all exams for admin", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const mockExams = [
                { id: "1", title: "Published Exam", is_published: true },
                { id: "2", title: "Draft Exam", is_published: false },
            ];

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: mockExams, error: null }),
                }),
            } as any);

            const result = await examService.getAdminExams();

            expect(supabase.from).toHaveBeenCalledWith("exams");
            expect(result).toEqual(mockExams);
        });
    });

    describe("createExam", () => {
        it("should create a new exam", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const newExam = {
                title: "New Exam",
                slug: "new-exam",
                description: "Test description",
            };

            const createdExam = { id: "123", ...newExam };

            vi.mocked(supabase.from).mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: createdExam, error: null }),
                    }),
                }),
            } as any);

            const result = await examService.createExam(newExam as any);

            expect(result).toEqual(createdExam);
        });
    });

    describe("deleteExam", () => {
        it("should delete an exam", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            vi.mocked(supabase.from).mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            } as any);

            await expect(examService.deleteExam("123")).resolves.not.toThrow();
        });
    });
});
