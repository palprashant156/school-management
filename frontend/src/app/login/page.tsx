'use client';

// =============================================================================
// LOGIN PAGE
// =============================================================================
// Modern login page with:
// - Glassmorphism card design
// - Form validation
// - Error handling
// - Loading states
// =============================================================================

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { School, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { AxiosError } from 'axios';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

// -----------------------------------------------------------------------------
// Login Form Component (with useSearchParams)
// -----------------------------------------------------------------------------

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isLoading } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get callback URL if any
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    // Form Validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            await login(formData);

            // Set token in cookie for middleware (in addition to localStorage)
            document.cookie = `access_token=${localStorage.getItem('access_token')}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

            router.push(callbackUrl);
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Invalid email or password';
            setErrors({ general: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Input Change Handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 animate-fade-in">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center">
                <div className="inline-flex items-center gap-2 mb-6">
                    <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                        <School size={22} className="text-white" />
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>EduManage</span>
                </div>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                    Sign in to your account
                </h2>
                <p className="mt-2" style={{ color: 'var(--foreground-muted)' }}>
                    Enter your credentials to access your dashboard
                </p>
            </div>

            {/* Error Alert */}
            {errors.general && (
                <div
                    className="flex items-center gap-3 p-4 rounded-lg animate-fade-in"
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                >
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-500">{errors.general}</p>
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            Password
                        </label>
                        <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--foreground-muted)' }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                    <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm" style={{ color: 'var(--foreground-muted)' }}>
                        Remember me for 30 days
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="btn btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting || isLoading ? (
                        <>
                            <div className="spinner"></div>
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <>
                            <span>Sign in</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            {/* Register Link */}
            <p className="text-center" style={{ color: 'var(--foreground-muted)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                    Create account
                </Link>
            </p>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Loading Fallback
// -----------------------------------------------------------------------------

function LoginFormSkeleton() {
    return (
        <div className="w-full max-w-md space-y-8 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Login Page Component (Main Export)
// -----------------------------------------------------------------------------

export default function LoginPage() {
    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 gradient-primary p-12 flex-col justify-between relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <School size={28} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">EduManage</span>
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                        Welcome to the<br />School Management<br />System
                    </h1>
                    <p className="text-lg text-white/80 max-w-md">
                        Streamline your educational institution with our comprehensive management platform.
                        Manage students, teachers, classes, attendance, and grades all in one place.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <div className="glass rounded-xl px-6 py-4 text-center">
                            <p className="text-2xl font-bold text-white">500+</p>
                            <p className="text-sm text-white/80">Schools</p>
                        </div>
                        <div className="glass rounded-xl px-6 py-4 text-center">
                            <p className="text-2xl font-bold text-white">50K+</p>
                            <p className="text-sm text-white/80">Students</p>
                        </div>
                        <div className="glass rounded-xl px-6 py-4 text-center">
                            <p className="text-2xl font-bold text-white">99.9%</p>
                            <p className="text-sm text-white/80">Uptime</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-sm text-white/60">© 2026 EduManage. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div
                className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
                style={{ background: 'var(--background)' }}
            >
                <Suspense fallback={<LoginFormSkeleton />}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
