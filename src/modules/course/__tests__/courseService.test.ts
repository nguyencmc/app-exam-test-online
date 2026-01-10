// Unit Tests for Course Service

import { describe, it, expect, vi, beforeEach } from "vitest";
import { courseService } from "../services/courseService";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockReturnThis(),
            single: vi.fn(),
            maybeSingle: vi.fn(),
        })),
    },
}));

describe("courseService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getCourses", () => {
        it("should fetch paginated courses", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const mockCourses = [
                { id: "1", title: "Course 1" },
                { id: "2", title: "Course 2" },
            ];

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        range: vi.fn().mockResolvedValue({ data: mockCourses, count: 10, error: null }),
                    }),
                }),
            } as any);

            const result = await courseService.getCourses(1, 10);

            expect(result.data).toEqual(mockCourses);
            expect(result.page).toBe(1);
            expect(result.pageSize).toBe(10);
        });

        it("should apply search filter", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const mockCourses = [{ id: "1", title: "React Course" }];
            const mockIlike = vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: mockCourses, count: 1, error: null }),
            });

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        ilike: mockIlike,
                        range: vi.fn().mockResolvedValue({ data: mockCourses, count: 1, error: null }),
                    }),
                    ilike: mockIlike,
                }),
            } as any);

            const result = await courseService.getCourses(1, 10, { search: "React" });

            expect(result.data).toBeDefined();
        });
    });

    describe("createCourse", () => {
        it("should create a new course", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const newCourse = {
                title: "New Course",
                description: "Course description",
            };

            const createdCourse = { id: "123", ...newCourse };

            vi.mocked(supabase.from).mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: createdCourse, error: null }),
                    }),
                }),
            } as any);

            const result = await courseService.createCourse(newCourse as any);

            expect(result).toEqual(createdCourse);
        });
    });

    describe("enrollInCourse", () => {
        it("should enroll user in a course", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const enrollment = {
                course_id: "course-123",
                user_id: "user-456",
            };

            vi.mocked(supabase.from).mockReturnValue({
                insert: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: enrollment, error: null }),
                    }),
                }),
            } as any);

            const result = await courseService.enrollInCourse("course-123", "user-456");

            expect(result).toEqual(enrollment);
        });
    });

    describe("deleteCourse", () => {
        it("should delete a course", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            vi.mocked(supabase.from).mockReturnValue({
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            } as any);

            await expect(courseService.deleteCourse("123")).resolves.not.toThrow();
        });
    });
});
