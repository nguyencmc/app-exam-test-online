// User Role Hook - Auth Module
// Fetches and provides user role information (Using Backend API)

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { AppRole } from '../types/auth.types';

interface UserRoleResult {
    roles: AppRole[];
    isAdmin: boolean;
    isTeacher: boolean;
    isModerator: boolean;
    loading: boolean;
    hasRole: (role: AppRole) => boolean;
}

export const useUserRole = (): UserRoleResult => {
    const { user, loading: authLoading } = useAuth();
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setRoles([]);
            setLoading(false);
            return;
        }

        // Get role from user object (Backend already provides it)
        const userRole = (user.role as AppRole) || 'user';
        setRoles([userRole]);
        setLoading(false);
    }, [user, authLoading]);

    const hasRole = (role: AppRole): boolean => {
        // Admin has all roles
        if (roles.includes('admin')) return true;
        // Teacher has teacher and user roles
        if (roles.includes('teacher') && (role === 'teacher' || role === 'user')) return true;
        return roles.includes(role);
    };

    return {
        roles,
        isAdmin: roles.includes('admin'),
        isTeacher: roles.includes('teacher'),
        isModerator: roles.includes('moderator'),
        loading,
        hasRole,
    };
};
