// Authentication Service - Auth Module
// API calls for authentication and user management

import { supabase } from '@/integrations/supabase/client';
import type { Profile, ProfileUpdate, AppRole } from '../types/auth.types';

export const authService = {
    /**
     * Sign up with email and password
     */
    async signUp(email: string, password: string, fullName?: string) {
        const redirectUrl = `${window.location.origin}/`;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    full_name: fullName || '',
                }
            }
        });

        return { data, error };
    },

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    /**
     * Get current session
     */
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        return { session, error };
    },

    /**
     * Get current user
     */
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    },

    /**
     * Get user profile
     */
    async getProfile(userId: string): Promise<Profile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return data;
    },

    /**
     * Update user profile
     */
    async updateProfile(userId: string, profile: ProfileUpdate): Promise<Profile> {
        const { data, error } = await supabase
            .from('profiles')
            .update(profile)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get user role
     */
    async getUserRole(userId: string): Promise<AppRole | null> {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return 'user';
            throw error;
        }

        return data?.role as AppRole || 'user';
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
     * Request password reset
     */
    async resetPassword(email: string) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        return { data, error };
    },

    /**
     * Update password
     */
    async updatePassword(newPassword: string) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        return { data, error };
    },

    /**
     * Sign in with OAuth provider
     */
    async signInWithProvider(provider: 'google' | 'github' | 'facebook') {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });
        return { data, error };
    },
};
