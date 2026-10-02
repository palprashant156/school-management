// =============================================================================
// AXIOS INSTANCE WITH JWT INTERCEPTORS
// =============================================================================
// This module creates a pre-configured Axios instance that:
// 1. Automatically attaches JWT tokens to all requests
// 2. Handles token refresh on 401 errors
// 3. Provides consistent error handling
// =============================================================================

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Cookie/localStorage key for storing the access token
const TOKEN_KEY = 'access_token';

// -----------------------------------------------------------------------------
// Axios Instance
// -----------------------------------------------------------------------------

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

// -----------------------------------------------------------------------------
// Token Management Helpers
// -----------------------------------------------------------------------------

/**
 * Get the stored access token from localStorage
 * Note: Only works on client-side
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store the access token in localStorage
 */
export const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the access token from localStorage
 */
export const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
};

// -----------------------------------------------------------------------------
// Request Interceptor
// -----------------------------------------------------------------------------
// Automatically attach the JWT token to every outgoing request

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// -----------------------------------------------------------------------------
// Response Interceptor
// -----------------------------------------------------------------------------
// Handle common error scenarios and token refresh

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Skip token refresh for auth endpoints to prevent loops
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');

        // Handle 401 Unauthorized errors (but not for auth endpoints)
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            // If we're already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            // Check if we have a token to refresh
            const currentToken = getToken();
            if (!currentToken) {
                // No token, just reject - don't try to refresh
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the token
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
                    withCredentials: true,
                });

                const { access_token } = response.data;
                setToken(access_token);
                processQueue(null, access_token);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                removeToken();
                // Don't redirect here - let the AuthContext handle it
                // This prevents infinite redirect loops
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default api;
