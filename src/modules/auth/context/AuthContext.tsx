// Authentication Context - Auth Module
// Provides auth state and methods throughout the app (Using Backend API)

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
    id: string;
    email: string;
    fullName?: string;
    role: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            // Verify token and get user info
            api.get<{ user: User }>('/auth/me')
                .then(({ user }) => {
                    setUser(user);
                })
                .catch(() => {
                    // Token invalid, remove it
                    localStorage.removeItem(TOKEN_KEY);
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const signUp = async (email: string, password: string, fullName?: string) => {
        try {
            const response = await api.post<{ token: string; user: User }>('/auth/register', {
                email,
                password,
                fullName,
            });

            localStorage.setItem(TOKEN_KEY, response.token);
            setUser(response.user);
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await api.post<{ token: string; user: User }>('/auth/login', {
                email,
                password,
            });

            localStorage.setItem(TOKEN_KEY, response.token);
            setUser(response.user);
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
