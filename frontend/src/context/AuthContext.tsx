'use client';

// =============================================================================
// AUTHENTICATION CONTEXT PROVIDER
// =============================================================================
// This context provides global authentication state and methods:
// - User information and role
// - JWT token management
// - Login/Logout functionality
// - Protected route handling
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getToken, setToken, removeToken } from '@/lib/api';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types';

// -----------------------------------------------------------------------------
// Context Types
// -----------------------------------------------------------------------------

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

// -----------------------------------------------------------------------------
// Context Creation
// -----------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -----------------------------------------------------------------------------
// Auth Provider Component
// -----------------------------------------------------------------------------

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Computed authentication state
    const isAuthenticated = !!token && !!user;

    // ---------------------------------------------------------------------------
    // Fetch Current User Profile
    // ---------------------------------------------------------------------------

    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get<User>('/auth/profile');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // If profile fetch fails, clear authentication
            removeToken();
            setTokenState(null);
            setUser(null);
        }
    }, []);

    // ---------------------------------------------------------------------------
    // Initialize Auth State on Mount
    // ---------------------------------------------------------------------------

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = getToken();

            if (storedToken) {
                setTokenState(storedToken);
                await refreshUser();
            }

            setIsLoading(false);
        };

        initAuth();
    }, [refreshUser]);

    // ---------------------------------------------------------------------------
    // Login Function
    // ---------------------------------------------------------------------------

    const login = async (credentials: LoginCredentials): Promise<void> => {
        setIsLoading(true);

        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            const { access_token, user: userData } = response.data;

            // Store token in localStorage and state
            setToken(access_token);
            setTokenState(access_token);

            // If user data is included in response, use it; otherwise fetch profile
            if (userData) {
                setUser(userData);
            } else {
                await refreshUser();
            }
        } catch (error) {
            // Re-throw to let the component handle the error
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Register Function
    // ---------------------------------------------------------------------------

    const register = async (credentials: RegisterCredentials): Promise<void> => {
        setIsLoading(true);

        try {
            const response = await api.post<AuthResponse>('/auth/register', credentials);
            const { access_token, user: userData } = response.data;

            // Store token if registration auto-logs in the user
            if (access_token) {
                setToken(access_token);
                setTokenState(access_token);

                if (userData) {
                    setUser(userData);
                } else {
                    await refreshUser();
                }
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Logout Function
    // ---------------------------------------------------------------------------

    const logout = (): void => {
        removeToken();
        setTokenState(null);
        setUser(null);

        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    // ---------------------------------------------------------------------------
    // Context Value
    // ---------------------------------------------------------------------------

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// -----------------------------------------------------------------------------
// Custom Hook for using Auth Context
// -----------------------------------------------------------------------------

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

// -----------------------------------------------------------------------------
// Export Context (for testing purposes)
// -----------------------------------------------------------------------------

export { AuthContext };
