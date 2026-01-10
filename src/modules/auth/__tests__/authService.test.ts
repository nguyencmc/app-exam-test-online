// Sample Test for Auth Service
// Demonstrates how to write tests for modules

import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../services/authService";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
        auth: {
            signUp: vi.fn(),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            getSession: vi.fn(),
            getUser: vi.fn(),
            resetPasswordForEmail: vi.fn(),
            updateUser: vi.fn(),
            signInWithOAuth: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
        })),
    },
}));

describe("authService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("signUp", () => {
        it("should call supabase signUp with correct parameters", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
                data: { user: { id: "123" }, session: null },
                error: null,
            } as any);

            const result = await authService.signUp("test@example.com", "password123", "Test User");

            expect(supabase.auth.signUp).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
                options: {
                    emailRedirectTo: expect.any(String),
                    data: { full_name: "Test User" },
                },
            });
            expect(result.error).toBeNull();
        });

        it("should return error when signUp fails", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            const mockError = { message: "Email already exists" };
            vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
                data: { user: null, session: null },
                error: mockError,
            } as any);

            const result = await authService.signUp("test@example.com", "password123");

            expect(result.error).toEqual(mockError);
        });
    });

    describe("signIn", () => {
        it("should call supabase signInWithPassword", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
                data: { user: { id: "123" }, session: { access_token: "token" } },
                error: null,
            } as any);

            const result = await authService.signIn("test@example.com", "password123");

            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
            });
            expect(result.error).toBeNull();
        });
    });

    describe("signOut", () => {
        it("should call supabase signOut", async () => {
            const { supabase } = await import("@/integrations/supabase/client");

            vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
                error: null,
            } as any);

            const result = await authService.signOut();

            expect(supabase.auth.signOut).toHaveBeenCalled();
            expect(result.error).toBeNull();
        });
    });
});
