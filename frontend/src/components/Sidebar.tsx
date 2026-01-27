'use client';

// =============================================================================
// ROLE-BASED SIDEBAR NAVIGATION
// =============================================================================
// This component renders a responsive sidebar with navigation items
// filtered based on the user's role (admin, teacher, student)
// =============================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    UserCog,
    BookOpen,
    ClipboardCheck,
    FileSpreadsheet,
    Settings,
    LogOut,
    School,
    ChevronLeft,
    Menu,
    Shield,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles: UserRole[]; // Which roles can see this item
}

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

// -----------------------------------------------------------------------------
// Navigation Configuration
// -----------------------------------------------------------------------------

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard size={20} />,
        roles: ['admin', 'teacher', 'student'],
    },
    {
        label: 'Users',
        href: '/dashboard/users',
        icon: <Users size={20} />,
        roles: ['admin'],
    },
    {
        label: 'Roles',
        href: '/dashboard/roles',
        icon: <Shield size={20} />,
        roles: ['admin'],
    },
    {
        label: 'Classes',
        href: '/dashboard/classes',
        icon: <School size={20} />,
        roles: ['admin', 'teacher'],
    },
    {
        label: 'Students',
        href: '/dashboard/students',
        icon: <GraduationCap size={20} />,
        roles: ['admin', 'teacher'],
    },
    {
        label: 'Teachers',
        href: '/dashboard/teachers',
        icon: <UserCog size={20} />,
        roles: ['admin'],
    },
    {
        label: 'My Classes',
        href: '/dashboard/my-classes',
        icon: <BookOpen size={20} />,
        roles: ['student'],
    },
    {
        label: 'Attendance',
        href: '/dashboard/attendance',
        icon: <ClipboardCheck size={20} />,
        roles: ['admin', 'teacher', 'student'],
    },
    {
        label: 'Marks',
        href: '/dashboard/marks',
        icon: <FileSpreadsheet size={20} />,
        roles: ['admin', 'teacher', 'student'],
    },
    {
        label: 'Settings',
        href: '/dashboard/settings',
        icon: <Settings size={20} />,
        roles: ['admin', 'teacher', 'student'],
    },
];

// -----------------------------------------------------------------------------
// Sidebar Component
// -----------------------------------------------------------------------------

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Helper to extract role name from union type
    const getRoleName = (role: unknown): UserRole | undefined => {
        if (!role) return undefined;
        if (typeof role === 'string') return role as UserRole;
        if (typeof role === 'object' && role !== null && 'name' in role) {
            return (role as { name: string }).name as UserRole;
        }
        return undefined;
    };

    // Filter navigation items based on user role
    const userRole = getRoleName(user?.role);
    const filteredNavItems = navItems.filter((item) => {
        if (!userRole) return false;
        return item.roles.includes(userRole);
    });

    // Check if a nav item is active
    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`
        fixed left-0 top-0 z-40 h-screen
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
            style={{ background: 'var(--sidebar-bg)' }}
        >
            {/* Logo & Toggle */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
                {!isCollapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                            <School size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-semibold text-white">EduManage</span>
                    </Link>
                )}

                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: 'var(--sidebar-text)' }}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${active
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }
              `}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="border-t border-white/10 p-4">
                {/* User Info */}
                {user && !isCollapsed && (
                    <div className="mb-3 px-2">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-600/20 text-primary-300 capitalize">
                            {getRoleName(user.role) || 'user'}
                        </span>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-slate-300 hover:bg-red-500/20 hover:text-red-400
            transition-all duration-200
          `}
                    title={isCollapsed ? 'Logout' : undefined}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
