// Auth Module Types
// Re-export from Supabase generated types

import type { Database } from '@/shared/integrations/supabase/types';

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Insert/Update types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Enum types
export type AppRole = Database['public']['Enums']['app_role'];

// Custom types
export interface AuthUser {
    id: string;
    email: string;
    profile?: Profile;
    role?: AppRole;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
