'use client';

// =============================================================================
// REGISTER PAGE
// =============================================================================
// User registration page with form validation
// =============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { School, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { AxiosError } from 'axios';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

// -----------------------------------------------------------------------------
// Register Page Component
// -----------------------------------------------------------------------------

export default function RegisterPage() {
    const router = useRouter();
    const { register, isLoading } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // ---------------------------------------------------------------------------
    // Form Validation
    // ---------------------------------------------------------------------------

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        }

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

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ---------------------------------------------------------------------------
    // Form Submission
    // ---------------------------------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            await register({
                username: formData.name,
                email: formData.email,
                password: formData.password,
            });

            setSuccess(true);

            // Redirect to login after a short delay
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Registration failed. Please try again.';
            setErrors({ general: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Input Change Handler
    // ---------------------------------------------------------------------------

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 gradient-accent p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-32 left-32 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-24 right-16 w-80 h-80 bg-white rounded-full blur-3xl"></div>
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
                        Join Our<br />Educational<br />Community
                    </h1>
                    <p className="text-lg text-white/80 max-w-md">
                        Create your account and start managing your educational journey effectively.
                    </p>
                </div>

                <div className="relative z-10">
                    <p className="text-sm text-white/60">© 2026 EduManage. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel - Register Form */}
            <div
                className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
                style={{ background: 'var(--background)' }}
            >
                <div className="w-full max-w-md space-y-8 animate-fade-in">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center">
                        <div className="inline-flex items-center gap-2 mb-6">
                            <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center">
                                <School size={22} className="text-white" />
                            </div>
                            <span className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>EduManage</span>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Create your account
                        </h2>
                        <p className="mt-2" style={{ color: 'var(--foreground-muted)' }}>
                            Fill in your details to get started
                        </p>
                    </div>

                    {/* Success Alert */}
                    {success && (
                        <div
                            className="flex items-center gap-3 p-4 rounded-lg animate-fade-in"
                            style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            <p className="text-sm text-green-600">Registration successful! Redirecting to login...</p>
                        </div>
                    )}

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

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                Full Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

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
                            <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
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

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoading || success}
                            className="btn btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <div className="spinner"></div>
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center" style={{ color: 'var(--foreground-muted)' }}>
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
