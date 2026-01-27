'use client';

// =============================================================================
// TEACHERS PAGE
// =============================================================================
// Teachers management page with data table and Add/Edit functionality
// =============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Teacher } from '@/types';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    UserCog,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TeacherFormData {
    name: string;
    email: string;
    subject: string;
}

// -----------------------------------------------------------------------------
// Teachers Page Component
// -----------------------------------------------------------------------------

export default function TeachersPage() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState<TeacherFormData>({
        name: '',
        email: '',
        subject: '',
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const itemsPerPage = 10;
    const isAdmin = user?.role === 'admin';

    // Helper to get teacher name from user relation
    const getTeacherName = (teacher: Teacher): string => {
        if (teacher.user?.firstName && teacher.user?.lastName) {
            return `${teacher.user.firstName} ${teacher.user.lastName}`;
        }
        return teacher.name || teacher.user?.username || 'Unknown Teacher';
    };

    // Helper to get teacher email from user relation
    const getTeacherEmail = (teacher: Teacher): string => {
        return teacher.email || teacher.user?.email || '';
    };

    // ---------------------------------------------------------------------------
    // Fetch Data
    // ---------------------------------------------------------------------------

    const fetchTeachers = useCallback(async () => {
        try {
            const response = await api.get('/school/teachers');
            setTeachers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    // ---------------------------------------------------------------------------
    // Filter and Paginate
    // ---------------------------------------------------------------------------

    const filteredTeachers = teachers.filter(
        (teacher) => {
            const teacherName = getTeacherName(teacher);
            const teacherEmail = getTeacherEmail(teacher);
            return (
                teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacherEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    );

    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
    const paginatedTeachers = filteredTeachers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ---------------------------------------------------------------------------
    // Modal Handlers
    // ---------------------------------------------------------------------------

    const openAddModal = () => {
        setEditingTeacher(null);
        setFormData({ name: '', email: '', subject: '' });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            name: getTeacherName(teacher),
            email: getTeacherEmail(teacher),
            subject: teacher.subject || '',
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTeacher(null);
        setFormData({ name: '', email: '', subject: '' });
        setFormError('');
    };

    // ---------------------------------------------------------------------------
    // Form Handlers
    // ---------------------------------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                subject: formData.subject || undefined,
            };

            if (editingTeacher) {
                await api.patch(`/school/teachers/${editingTeacher.id}`, payload);
            } else {
                await api.post('/school/teachers', payload);
            }

            await fetchTeachers();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setFormError(err.response?.data?.message || 'Failed to save teacher');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this teacher?')) return;

        try {
            await api.delete(`/school/teachers/${id}`);
            await fetchTeachers();
        } catch (error) {
            console.error('Failed to delete teacher:', error);
        }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <DashboardLayout title="Teachers">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Teachers
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Manage all teachers in your institution
                        </p>
                    </div>
                    {isAdmin && (
                        <button onClick={openAddModal} className="btn btn-primary">
                            <Plus size={18} />
                            Add Teacher
                        </button>
                    )}
                </div>

                {/* Search & Filters */}
                <div className="card p-4">
                    <div className="relative max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--foreground-muted)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search teachers..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="spinner mx-auto"></div>
                            <p className="mt-4" style={{ color: 'var(--foreground-muted)' }}>
                                Loading teachers...
                            </p>
                        </div>
                    ) : paginatedTeachers.length === 0 ? (
                        <div className="p-8 text-center">
                            <UserCog
                                size={48}
                                className="mx-auto mb-4"
                                style={{ color: 'var(--foreground-muted)' }}
                            />
                            <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                                No teachers found
                            </p>
                            <p style={{ color: 'var(--foreground-muted)' }}>
                                {searchQuery ? 'Try a different search query' : 'Add your first teacher'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Subject
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Classes
                                            </th>
                                            {isAdmin && (
                                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
                                                    style={{ color: 'var(--foreground-muted)' }}>
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTeachers.map((teacher, index) => (
                                            <tr
                                                key={teacher.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                style={{
                                                    borderBottom: index < paginatedTeachers.length - 1 ? '1px solid var(--border)' : undefined,
                                                }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-br from-purple-500 to-purple-600">
                                                            {getTeacherName(teacher).charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                            {getTeacherName(teacher)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4" style={{ color: 'var(--foreground-muted)' }}>
                                                    {getTeacherEmail(teacher)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {teacher.subject ? (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                            {teacher.subject}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--foreground-muted)' }}>-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4" style={{ color: 'var(--foreground)' }}>
                                                    {teacher.classes?.length || 0}
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditModal(teacher)}
                                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                style={{ color: 'var(--foreground-muted)' }}
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(teacher.id)}
                                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t"
                                    style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                        {Math.min(currentPage * itemsPerPage, filteredTeachers.length)} of{' '}
                                        {filteredTeachers.length} results
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="px-3 py-1 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div
                        className="card w-full max-w-md p-6 animate-fade-in"
                        style={{ background: 'var(--background-secondary)' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600">
                                <AlertCircle size={18} />
                                <span className="text-sm">{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="input"
                                    placeholder="e.g., Mathematics, Science"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary flex-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="spinner"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        editingTeacher ? 'Save Changes' : 'Add Teacher'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
