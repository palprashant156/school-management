'use client';

// =============================================================================
// ATTENDANCE PAGE
// =============================================================================
// Attendance management page with class selection and student checklist
// =============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Student, Class, Attendance } from '@/types';
import {
    ClipboardCheck,
    Calendar,
    Check,
    X,
    Clock,
    Save,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type AttendanceStatus = 'present' | 'absent' | 'late';

interface AttendanceRecord {
    studentId: number;
    status: AttendanceStatus;
}

// -----------------------------------------------------------------------------
// Attendance Page Component
// -----------------------------------------------------------------------------

export default function AttendancePage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [attendance, setAttendance] = useState<Map<number, AttendanceStatus>>(new Map());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Helper to get display name from student
    const getStudentName = (student: Student): string => {
        if (student.firstName && student.lastName) {
            return `${student.firstName} ${student.lastName}`;
        }
        return student.name || student.username || 'Unknown';
    };

    // ---------------------------------------------------------------------------
    // Fetch Data
    // ---------------------------------------------------------------------------

    const fetchClasses = useCallback(async () => {
        try {
            const response = await api.get('/school/classes');
            setClasses(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Failed to fetch classes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStudentsByClass = useCallback(async (classId: string) => {
        if (!classId) {
            setStudents([]);
            return;
        }

        try {
            const response = await api.get(`/school/students?classId=${classId}`);
            const studentList = Array.isArray(response.data) ? response.data : [];
            setStudents(studentList);

            // Initialize all students as present by default
            const initialAttendance = new Map<number, AttendanceStatus>();
            studentList.forEach((student: Student) => {
                initialAttendance.set(student.id, 'present');
            });
            setAttendance(initialAttendance);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    }, []);

    const fetchExistingAttendance = useCallback(async () => {
        if (!selectedClass || !selectedDate) return;

        try {
            const response = await api.get(
                `/school/attendance?classId=${selectedClass}&date=${selectedDate}`
            );

            if (Array.isArray(response.data) && response.data.length > 0) {
                const existingAttendance = new Map<number, AttendanceStatus>();
                response.data.forEach((record: Attendance) => {
                    existingAttendance.set(record.studentId, record.status);
                });
                setAttendance(existingAttendance);
            }
        } catch (err) {
            // No existing attendance, keep default values
            console.log('No existing attendance found:', err);
        }
    }, [selectedClass, selectedDate]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    useEffect(() => {
        fetchStudentsByClass(selectedClass);
    }, [selectedClass, fetchStudentsByClass]);

    useEffect(() => {
        fetchExistingAttendance();
    }, [fetchExistingAttendance]);

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendance((prev) => new Map(prev).set(studentId, status));
        setSuccess(false);
    };

    const handleSave = async () => {
        if (!selectedClass || students.length === 0) return;

        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const records: AttendanceRecord[] = students.map((student) => ({
                studentId: student.id,
                status: attendance.get(student.id) || 'present',
            }));

            await api.post('/school/attendance', {
                classId: parseInt(selectedClass),
                date: selectedDate,
                records,
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const markAllAs = (status: AttendanceStatus) => {
        const updated = new Map<number, AttendanceStatus>();
        students.forEach((student) => {
            updated.set(student.id, status);
        });
        setAttendance(updated);
        setSuccess(false);
    };

    // ---------------------------------------------------------------------------
    // Stats
    // ---------------------------------------------------------------------------

    const stats = {
        present: Array.from(attendance.values()).filter((s) => s === 'present').length,
        absent: Array.from(attendance.values()).filter((s) => s === 'absent').length,
        late: Array.from(attendance.values()).filter((s) => s === 'late').length,
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <DashboardLayout title="Attendance">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Attendance
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Mark attendance for your classes
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Select Class
                            </label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="input"
                            >
                                <option value="">Choose a class</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} {cls.section ? `- ${cls.section}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Select Date
                            </label>
                            <div className="relative">
                                <Calendar
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: 'var(--foreground-muted)' }}
                                />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="input pl-10"
                                />
                            </div>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleSave}
                                disabled={!selectedClass || students.length === 0 || saving}
                                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="spinner"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Attendance
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {success && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 animate-fade-in">
                        <CheckCircle size={20} className="text-green-500" />
                        <span className="text-green-700 dark:text-green-300">Attendance saved successfully!</span>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
                        <AlertCircle size={20} className="text-red-500" />
                        <span className="text-red-700 dark:text-red-300">{error}</span>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="card p-8 text-center">
                        <div className="spinner mx-auto"></div>
                        <p className="mt-4" style={{ color: 'var(--foreground-muted)' }}>
                            Loading...
                        </p>
                    </div>
                ) : !selectedClass ? (
                    <div className="card p-8 text-center">
                        <ClipboardCheck
                            size={48}
                            className="mx-auto mb-4"
                            style={{ color: 'var(--foreground-muted)' }}
                        />
                        <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                            Select a class to mark attendance
                        </p>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Choose a class from the dropdown above
                        </p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="card p-8 text-center">
                        <ClipboardCheck
                            size={48}
                            className="mx-auto mb-4"
                            style={{ color: 'var(--foreground-muted)' }}
                        />
                        <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                            No students in this class
                        </p>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Add students to this class first
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="card p-4 text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                                    <Check size={20} className="text-green-600" />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                                    {stats.present}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Present</p>
                            </div>
                            <div className="card p-4 text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
                                    <X size={20} className="text-red-600" />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                                    {stats.absent}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Absent</p>
                            </div>
                            <div className="card p-4 text-center">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-2">
                                    <Clock size={20} className="text-amber-600" />
                                </div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                                    {stats.late}
                                </p>
                                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Late</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => markAllAs('present')}
                                className="btn btn-secondary text-sm"
                            >
                                <Check size={16} />
                                Mark All Present
                            </button>
                            <button
                                onClick={() => markAllAs('absent')}
                                className="btn btn-secondary text-sm"
                            >
                                <X size={16} />
                                Mark All Absent
                            </button>
                        </div>

                        {/* Student List */}
                        <div className="card overflow-hidden">
                            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {students.map((student) => {
                                    const status = attendance.get(student.id) || 'present';

                                    return (
                                        <div
                                            key={student.id}
                                            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium gradient-primary">
                                                    {getStudentName(student).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                        {getStudentName(student)}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                                        {student.roll_no || student.rollNumber || student.email || ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'present')}
                                                    className={`p-2 rounded-lg transition-all ${status === 'present'
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                        }`}
                                                    title="Present"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'absent')}
                                                    className={`p-2 rounded-lg transition-all ${status === 'absent'
                                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                        }`}
                                                    title="Absent"
                                                >
                                                    <X size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'late')}
                                                    className={`p-2 rounded-lg transition-all ${status === 'late'
                                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                                                        }`}
                                                    title="Late"
                                                >
                                                    <Clock size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
