'use client';

// =============================================================================
// DASHBOARD PAGE
// =============================================================================
// Main dashboard with role-based statistics and overview
// =============================================================================

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
    Users,
    GraduationCap,
    UserCog,
    School,
    ClipboardCheck,
    TrendingUp,
    Calendar,
    BookOpen,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface DashboardStats {
    totalStudents?: number;
    totalTeachers?: number;
    totalClasses?: number;
    totalUsers?: number;
    attendanceRate?: number;
    pendingAttendance?: number;
    myClasses?: number;
    avgMarks?: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color: string;
}

// -----------------------------------------------------------------------------
// Stat Card Component
// -----------------------------------------------------------------------------

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
    return (
        <div className="card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {value}
                    </p>
                    {trend && (
                        <p className="mt-2 text-sm flex items-center gap-1 text-green-500">
                            <TrendingUp size={14} />
                            {trend}
                        </p>
                    )}
                </div>
                <div
                    className={`p-3 rounded-xl ${color}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------------
// Dashboard Page Component
// -----------------------------------------------------------------------------

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({});
    const [loading, setLoading] = useState(true);

    // Fetch dashboard statistics
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallel fetch for better performance
                const [studentsRes, teachersRes, classesRes] = await Promise.allSettled([
                    api.get('/school/students'),
                    api.get('/school/teachers'),
                    api.get('/school/classes'),
                ]);

                setStats({
                    totalStudents: studentsRes.status === 'fulfilled' ? studentsRes.value.data?.length || 0 : 0,
                    totalTeachers: teachersRes.status === 'fulfilled' ? teachersRes.value.data?.length || 0 : 0,
                    totalClasses: classesRes.status === 'fulfilled' ? classesRes.value.data?.length || 0 : 0,
                    attendanceRate: 94.5, // Placeholder - would come from API
                    pendingAttendance: 3,
                    avgMarks: 78.2,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Role-based stat cards
    const getStatCards = () => {
        const role = user?.role;

        const adminCards = [
            {
                title: 'Total Students',
                value: stats.totalStudents || 0,
                icon: <GraduationCap size={24} className="text-white" />,
                trend: '+12% this month',
                color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            },
            {
                title: 'Total Teachers',
                value: stats.totalTeachers || 0,
                icon: <UserCog size={24} className="text-white" />,
                trend: '+3% this month',
                color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            },
            {
                title: 'Total Classes',
                value: stats.totalClasses || 0,
                icon: <School size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            },
            {
                title: 'Attendance Rate',
                value: `${stats.attendanceRate || 0}%`,
                icon: <ClipboardCheck size={24} className="text-white" />,
                trend: '+2.1% this week',
                color: 'bg-gradient-to-br from-amber-500 to-orange-500',
            },
        ];

        const teacherCards = [
            {
                title: 'My Classes',
                value: stats.myClasses || stats.totalClasses || 0,
                icon: <BookOpen size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            },
            {
                title: 'Total Students',
                value: stats.totalStudents || 0,
                icon: <GraduationCap size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            },
            {
                title: 'Pending Attendance',
                value: stats.pendingAttendance || 0,
                icon: <Calendar size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-rose-500 to-pink-500',
            },
            {
                title: 'Average Marks',
                value: `${stats.avgMarks || 0}%`,
                icon: <TrendingUp size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            },
        ];

        const studentCards = [
            {
                title: 'My Classes',
                value: stats.myClasses || 5,
                icon: <BookOpen size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-blue-500 to-blue-600',
            },
            {
                title: 'Attendance Rate',
                value: `${stats.attendanceRate || 0}%`,
                icon: <ClipboardCheck size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            },
            {
                title: 'Average Marks',
                value: `${stats.avgMarks || 0}%`,
                icon: <TrendingUp size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-purple-500 to-purple-600',
            },
            {
                title: 'Upcoming Tests',
                value: 2,
                icon: <Calendar size={24} className="text-white" />,
                color: 'bg-gradient-to-br from-amber-500 to-orange-500',
            },
        ];

        switch (role) {
            case 'admin':
                return adminCards;
            case 'teacher':
                return teacherCards;
            case 'student':
                return studentCards;
            default:
                return adminCards;
        }
    };

    return (
        <DashboardLayout title="Dashboard">
            <div className="space-y-6 animate-fade-in">
                {/* Welcome Message */}
                <div className="card p-6 gradient-primary text-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Welcome back, {user?.name || user?.username || 'User'}! 👋
                            </h1>
                            <p className="mt-1 text-white/80">
                                Here&apos;s what&apos;s happening with your school today.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/80">
                            <Calendar size={16} />
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="card p-6 animate-pulse">
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {getStatCards().map((card, index) => (
                            <StatCard key={index} {...card} />
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                            Recent Activity
                        </h2>
                        <div className="space-y-4">
                            {[
                                { icon: <Users size={16} />, text: 'New student enrolled in Class 10A', time: '2 hours ago' },
                                { icon: <ClipboardCheck size={16} />, text: 'Attendance marked for Class 9B', time: '3 hours ago' },
                                { icon: <GraduationCap size={16} />, text: 'Exam results published for Math', time: '5 hours ago' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div
                                        className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20"
                                        style={{ color: 'var(--primary-600)' }}
                                    >
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm" style={{ color: 'var(--foreground)' }}>{item.text}</p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Chart Placeholder */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                            Attendance Overview
                        </h2>
                        <div className="h-48 flex items-center justify-center rounded-lg" style={{ background: 'var(--background)' }}>
                            <div className="text-center">
                                <ClipboardCheck size={48} className="mx-auto mb-2 text-primary-500" />
                                <p style={{ color: 'var(--foreground-muted)' }}>
                                    Chart visualization coming soon
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
