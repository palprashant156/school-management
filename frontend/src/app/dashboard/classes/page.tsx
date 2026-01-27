'use client';

// =============================================================================
// CLASSES PAGE
// =============================================================================
// Classes management page with data table and Add/Edit functionality
// =============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Class, Teacher } from '@/types';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    School,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ClassFormData {
    name: string;
    section: string;
    teacherId: string;
}

// -----------------------------------------------------------------------------
// Classes Page Component
// -----------------------------------------------------------------------------

export default function ClassesPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [formData, setFormData] = useState<ClassFormData>({
        name: '',
        section: '',
        teacherId: '',
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const itemsPerPage = 10;
    const isAdmin = user?.role === 'admin';

    // ---------------------------------------------------------------------------
    // Fetch Data
    // ---------------------------------------------------------------------------

    const fetchClasses = useCallback(async () => {
        try {
            const response = await api.get('/school/classes');
            setClasses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTeachers = useCallback(async () => {
        try {
            const response = await api.get('/school/teachers');
            setTeachers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, [fetchClasses, fetchTeachers]);

    // ---------------------------------------------------------------------------
    // Filter and Paginate
    // ---------------------------------------------------------------------------

    const filteredClasses = classes.filter(
        (cls) =>
            cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cls.section?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    const paginatedClasses = filteredClasses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ---------------------------------------------------------------------------
    // Modal Handlers
    // ---------------------------------------------------------------------------

    const openAddModal = () => {
        setEditingClass(null);
        setFormData({ name: '', section: '', teacherId: '' });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (cls: Class) => {
        setEditingClass(cls);
        setFormData({
            name: cls.name,
            section: cls.section || '',
            teacherId: cls.teacherId?.toString() || '',
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingClass(null);
        setFormData({ name: '', section: '', teacherId: '' });
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
                section: formData.section || undefined,
                teacherId: formData.teacherId ? parseInt(formData.teacherId) : undefined,
            };

            if (editingClass) {
                await api.patch(`/school/classes/${editingClass.id}`, payload);
            } else {
                await api.post('/school/classes', payload);
            }

            await fetchClasses();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setFormError(err.response?.data?.message || 'Failed to save class');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this class?')) return;

        try {
            await api.delete(`/school/classes/${id}`);
            await fetchClasses();
        } catch (error) {
            console.error('Failed to delete class:', error);
        }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <DashboardLayout title="Classes">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Classes
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Manage all classes in your institution
                        </p>
                    </div>
                    {isAdmin && (
                        <button onClick={openAddModal} className="btn btn-primary">
                            <Plus size={18} />
                            Add Class
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
                            placeholder="Search classes..."
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
                                Loading classes...
                            </p>
                        </div>
                    ) : paginatedClasses.length === 0 ? (
                        <div className="p-8 text-center">
                            <School
                                size={48}
                                className="mx-auto mb-4"
                                style={{ color: 'var(--foreground-muted)' }}
                            />
                            <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                                No classes found
                            </p>
                            <p style={{ color: 'var(--foreground-muted)' }}>
                                {searchQuery ? 'Try a different search query' : 'Add your first class'}
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
                                                Class Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Section
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Teacher
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Students
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
                                        {paginatedClasses.map((cls, index) => (
                                            <tr
                                                key={cls.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                style={{
                                                    borderBottom: index < paginatedClasses.length - 1 ? '1px solid var(--border)' : undefined,
                                                }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium gradient-primary">
                                                            {(cls.name || 'C').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                            {cls.name || 'Unnamed Class'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4" style={{ color: 'var(--foreground)' }}>
                                                    {cls.section || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {cls.teacher ? (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                            {cls.teacher.name}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--foreground-muted)' }}>-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4" style={{ color: 'var(--foreground)' }}>
                                                    {cls.students?.length || 0}
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditModal(cls)}
                                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                style={{ color: 'var(--foreground-muted)' }}
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(cls.id)}
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
                                        {Math.min(currentPage * itemsPerPage, filteredClasses.length)} of{' '}
                                        {filteredClasses.length} results
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
                                {editingClass ? 'Edit Class' : 'Add New Class'}
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
                                    Class Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="e.g., Grade 10, Class 12"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Section
                                </label>
                                <input
                                    type="text"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="input"
                                    placeholder="e.g., A, B, Science"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Assigned Teacher
                                </label>
                                <select
                                    value={formData.teacherId}
                                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                    className="input"
                                >
                                    <option value="">Select a teacher</option>
                                    {teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name} {teacher.subject ? `(${teacher.subject})` : ''}
                                        </option>
                                    ))}
                                </select>
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
                                        editingClass ? 'Save Changes' : 'Add Class'
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
