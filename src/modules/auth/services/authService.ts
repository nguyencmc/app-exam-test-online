// Authentication Service - Auth Module
// API calls for authentication and user management (Using Backend API)

import { api } from '@/lib/api';
import type { Profile, ProfileUpdate, AppRole } from '../types/auth.types';

interface User {
    id: string;
    email: string;
    fullName?: string;
    role: string;
}

interface AuthResponse {
    token: string;
    user: User;
    message: string;
}

const TOKEN_KEY = 'auth_token';

export const authService = {
    /**
     * Sign up with email and password
     */
    async signUp(email: string, password: string, fullName?: string) {
        try {
            const data = await api.post<AuthResponse>('/auth/register', {
                email,
                password,
                fullName,
            });
            localStorage.setItem(TOKEN_KEY, data.token);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string) {
        try {
            const data = await api.post<AuthResponse>('/auth/login', {
                email,
                password,
            });
            localStorage.setItem(TOKEN_KEY, data.token);
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    /**
     * Sign out
     */
    async signOut() {
        localStorage.removeItem(TOKEN_KEY);
        return { error: null };
    },

    /**
     * Get current session token
     */
    async getSession() {
        const token = localStorage.getItem(TOKEN_KEY);
        return { session: token ? { access_token: token } : null, error: null };
    },

    /**
     * Get current user
     */
    async getCurrentUser() {
        try {
            const { user } = await api.get<{ user: User }>('/auth/me');
            return { user, error: null };
        } catch (error) {
            return { user: null, error };
        }
    },

    /**
     * Get user profile (placeholder - needs backend implementation)
     */
    async getProfile(userId: string): Promise<Profile | null> {
        try {
            const { user } = await api.get<{ user: User }>('/auth/me');
            return {
                id: user.id,
                full_name: user.fullName || null,
                avatar_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
        } catch {
            return null;
        }
    },

    /**
     * Update user profile (placeholder - needs backend implementation)
     */
    async updateProfile(userId: string, profile: ProfileUpdate): Promise<Profile> {
        // TODO: Implement when backend supports profile update
        throw new Error('Profile update not yet implemented');
    },

    /**
     * Get user role
     */
    async getUserRole(userId: string): Promise<AppRole | null> {
        try {
            const { user } = await api.get<{ user: User }>('/auth/me');
            return (user.role as AppRole) || 'user';
        } catch {
            return 'user';
        }
    },

    /**
     * Check if user has specific role
     */
    async hasRole(userId: string, role: AppRole): Promise<boolean> {
        const userRole = await this.getUserRole(userId);

        // Admin has access to everything
        if (userRole === 'admin') return true;

        // Teacher has access to teacher and user roles
        if (userRole === 'teacher' && (role === 'teacher' || role === 'user')) return true;

        // Check exact match
        return userRole === role;
    },

    /**
     * Request password reset (placeholder - needs backend implementation)
     */
    async resetPassword(email: string) {
        // TODO: Implement when backend supports password reset
        return { data: null, error: new Error('Password reset not yet implemented') };
    },

    /**
     * Update password (placeholder - needs backend implementation)
     */
    async updatePassword(newPassword: string) {
        // TODO: Implement when backend supports password update
        return { data: null, error: new Error('Password update not yet implemented') };
    },

    /**
     * Sign in with OAuth provider (not supported in self-hosted mode)
     */
    async signInWithProvider(provider: 'google' | 'github' | 'facebook') {
        return { data: null, error: new Error('OAuth not supported in self-hosted mode') };
    },
};
