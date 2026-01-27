'use client';

// =============================================================================
// STUDENTS PAGE
// =============================================================================
// Students management page with data table and Add/Edit functionality
// =============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Student, Class } from '@/types';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface StudentFormData {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    roll_no: string;
    classId: string;
}

// -----------------------------------------------------------------------------
// Students Page Component
// -----------------------------------------------------------------------------

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<StudentFormData>({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        roll_no: '',
        classId: '',
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const itemsPerPage = 10;

    // ---------------------------------------------------------------------------
    // Fetch Data
    // ---------------------------------------------------------------------------

    const fetchStudents = useCallback(async () => {
        try {
            const response = await api.get('/school/students');
            setStudents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchClasses = useCallback(async () => {
        try {
            const response = await api.get('/school/classes');
            setClasses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, [fetchStudents, fetchClasses]);

    // ---------------------------------------------------------------------------
    // Filter and Paginate
    // ---------------------------------------------------------------------------

    // Helper to get display name from student
    const getStudentName = (student: Student): string => {
        if (student.firstName && student.lastName) {
            return `${student.firstName} ${student.lastName}`;
        }
        return student.name || student.username || 'Unknown';
    };

    const filteredStudents = students.filter(
        (student) => {
            const name = getStudentName(student);
            return (
                name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.roll_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    );

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ---------------------------------------------------------------------------
    // Modal Handlers
    // ---------------------------------------------------------------------------

    const openAddModal = () => {
        setEditingStudent(null);
        setFormData({ firstName: '', lastName: '', username: '', email: '', roll_no: '', classId: '' });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            username: student.username || '',
            email: student.email || '',
            roll_no: student.roll_no || student.rollNumber || '',
            classId: student.classId?.toString() || '',
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
        setFormData({ firstName: '', lastName: '', username: '', email: '', roll_no: '', classId: '' });
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
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                roll_no: formData.roll_no,
                classId: formData.classId,
            };

            if (editingStudent) {
                await api.patch(`/school/students/${editingStudent.id}`, payload);
            } else {
                await api.post('/school/students', payload);
            }

            await fetchStudents();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string | string[] } } };
            const message = err.response?.data?.message;
            if (Array.isArray(message)) {
                setFormError(message.join(', '));
            } else {
                setFormError(message || 'Failed to save student');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            await api.delete(`/school/students/${id}`);
            await fetchStudents();
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <DashboardLayout title="Students">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Students
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Manage all students in your institution
                        </p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <Plus size={18} />
                        Add Student
                    </button>
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
                            placeholder="Search students..."
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
                                Loading students...
                            </p>
                        </div>
                    ) : paginatedStudents.length === 0 ? (
                        <div className="p-8 text-center">
                            <GraduationCap
                                size={48}
                                className="mx-auto mb-4"
                                style={{ color: 'var(--foreground-muted)' }}
                            />
                            <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                                No students found
                            </p>
                            <p style={{ color: 'var(--foreground-muted)' }}>
                                {searchQuery ? 'Try a different search query' : 'Add your first student'}
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
                                                Roll Number
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Class
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedStudents.map((student, index) => {
                                            const displayName = getStudentName(student);
                                            return (
                                                <tr
                                                    key={student.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                    style={{
                                                        borderBottom: index < paginatedStudents.length - 1 ? '1px solid var(--border)' : undefined,
                                                    }}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium gradient-primary">
                                                                {(displayName || 'S').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                                {displayName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4" style={{ color: 'var(--foreground-muted)' }}>
                                                        {student.email || '-'}
                                                    </td>
                                                    <td className="px-6 py-4" style={{ color: 'var(--foreground)' }}>
                                                        {student.roll_no || student.rollNumber || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.class ? (
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                                                {student.class.name}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--foreground-muted)' }}>-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditModal(student)}
                                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                                style={{ color: 'var(--foreground-muted)' }}
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(student.id)}
                                                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t"
                                    style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                        {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of{' '}
                                        {filteredStudents.length} results
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
                        className="card w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
                        style={{ background: 'var(--background-secondary)' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                                {editingStudent ? 'Edit Student' : 'Add New Student'}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="input"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                                    Roll Number *
                                </label>
                                <input
                                    type="text"
                                    value={formData.roll_no}
                                    onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Class *
                                </label>
                                <select
                                    value={formData.classId}
                                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                    className="input"
                                    required
                                >
                                    <option value="">Select a class</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} {cls.section ? `- ${cls.section}` : ''}
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
                                        editingStudent ? 'Save Changes' : 'Add Student'
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