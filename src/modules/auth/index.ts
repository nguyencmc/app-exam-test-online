// Auth Module - Barrel Export
// All auth-related exports from this module

// Context
export { AuthProvider, useAuth } from './context/AuthContext';

// Services
export { authService } from './services/authService';

// Hooks
export { useUserRole } from './hooks/useUserRole';

// Types
export type {
    Profile,
    ProfileInsert,
    ProfileUpdate,
    AppRole,
    AuthUser,
    AuthState,
} from './types/auth.types';
