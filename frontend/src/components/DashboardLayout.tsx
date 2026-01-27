'use client';

// =============================================================================
// DASHBOARD LAYOUT COMPONENT
// =============================================================================
// Main layout wrapper for authenticated pages with:
// - Responsive sidebar
// - Header with search and user actions
// - Main content area
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Bell, Search, Menu } from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

// -----------------------------------------------------------------------------
// Dashboard Layout Component
// -----------------------------------------------------------------------------

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { user, isLoading } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="spinner w-10 h-10 border-4"></div>
                    <p className="text-foreground-muted">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, this shouldn't render (middleware handles redirect)
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--background)' }}>
            {/* Sidebar */}
            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div
                className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
            >
                {/* Header */}
                <header
                    className="sticky top-0 z-20 h-16 px-4 lg:px-6 flex items-center justify-between gap-4 border-b"
                    style={{
                        background: 'var(--background-secondary)',
                        borderColor: 'var(--border)'
                    }}
                >
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Page Title */}
                    {title && (
                        <h1 className="text-xl font-semibold hidden sm:block" style={{ color: 'var(--foreground)' }}>
                            {title}
                        </h1>
                    )}

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md hidden md:block">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--foreground-muted)' }}
                            />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="input pl-10 py-2"
                            />
                        </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button
                            className="relative p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--foreground-muted)' }}
                        >
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
                        </button>

                        {/* User Avatar */}
                        <div className="flex items-center gap-3">
                            <div
                                className="h-9 w-9 rounded-full flex items-center justify-center text-white font-medium gradient-primary"
                            >
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                    {user.name}
                                </p>
                                <p className="text-xs capitalize" style={{ color: 'var(--foreground-muted)' }}>
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
