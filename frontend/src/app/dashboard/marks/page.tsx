'use client';

// =============================================================================
// MARKS PAGE
// =============================================================================
// Marks management page with class/subject selection and grade input
// =============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Student, Class } from '@/types';
import {
    FileSpreadsheet,
    Save,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface MarkRecord {
    studentId: number;
    score: number;
}

// -----------------------------------------------------------------------------
// Marks Page Component
// -----------------------------------------------------------------------------

export default function MarksPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [examType, setExamType] = useState('');
    const [maxScore, setMaxScore] = useState(100);
    const [marks, setMarks] = useState<Map<number, number>>(new Map());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
    const examTypes = ['Unit Test', 'Mid-Term', 'Final Exam', 'Quiz', 'Assignment'];

    // Helper to get display name from student (data comes from user relation)
    const getStudentName = (student: Student): string => {
        // Check user relation first (backend stores name in user entity)
        if (student.user?.firstName && student.user?.lastName) {
            return `${student.user.firstName} ${student.user.lastName}`;
        }
        // Fallback to direct properties
        if (student.firstName && student.lastName) {
            return `${student.firstName} ${student.lastName}`;
        }
        return student.name || student.user?.username || student.username || 'Unknown';
    };

    // Helper to get student email from user relation
    const getStudentEmail = (student: Student): string => {
        return student.email || student.user?.email || '';
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

            // Initialize all marks to 0
            const initialMarks = new Map<number, number>();
            studentList.forEach((student: Student) => {
                initialMarks.set(student.id, 0);
            });
            setMarks(initialMarks);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    useEffect(() => {
        fetchStudentsByClass(selectedClass);
    }, [selectedClass, fetchStudentsByClass]);

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------

    const handleMarkChange = (studentId: number, score: number) => {
        // Clamp score between 0 and maxScore
        const clampedScore = Math.max(0, Math.min(maxScore, score));
        setMarks((prev) => new Map(prev).set(studentId, clampedScore));
        setSuccess(false);
    };

    const handleSave = async () => {
        if (!selectedClass || !subject || students.length === 0) return;

        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const records: MarkRecord[] = students.map((student) => ({
                studentId: student.id,
                score: marks.get(student.id) || 0,
            }));

            await api.post('/school/marks', {
                classId: parseInt(selectedClass),
                subject,
                examType: examType || undefined,
                maxScore,
                records,
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || 'Failed to save marks');
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------------------------
    // Stats
    // ---------------------------------------------------------------------------

    const scores = Array.from(marks.values()).filter((s) => s > 0);
    const stats = {
        average: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0',
        highest: scores.length > 0 ? Math.max(...scores) : 0,
        lowest: scores.length > 0 ? Math.min(...scores) : 0,
        passing: scores.filter((s) => s >= maxScore * 0.4).length,
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
        <DashboardLayout title="Marks">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Marks Entry
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Enter marks for your students
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Class *
                            </label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="input"
                            >
                                <option value="">Select class</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.class_name || cls.name || 'Unnamed'} {cls.section ? `- ${cls.section}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Subject *
                            </label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="input"
                            >
                                <option value="">Select subject</option>
                                {subjects.map((subj) => (
                                    <option key={subj} value={subj}>
                                        {subj}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Exam Type
                            </label>
                            <select
                                value={examType}
                                onChange={(e) => setExamType(e.target.value)}
                                className="input"
                            >
                                <option value="">Select type</option>
                                {examTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                Max Score
                            </label>
                            <input
                                type="number"
                                value={maxScore}
                                onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
                                className="input"
                                min={1}
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleSave}
                                disabled={!selectedClass || !subject || students.length === 0 || saving}
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
                                        Save Marks
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
                        <span className="text-green-700 dark:text-green-300">Marks saved successfully!</span>
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
                        <FileSpreadsheet
                            size={48}
                            className="mx-auto mb-4"
                            style={{ color: 'var(--foreground-muted)' }}
                        />
                        <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                            Select a class to enter marks
                        </p>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Choose a class and subject from the options above
                        </p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="card p-8 text-center">
                        <FileSpreadsheet
                            size={48}
                            className="mx-auto mb-4"
                            style={{ color: 'var(--foreground-muted)' }}
                        />
                        <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                            No students in this class
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="card p-4 text-center">
                                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Average</p>
                                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                                    {stats.average}
                                </p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Highest</p>
                                <p className="text-2xl font-bold text-green-600">{stats.highest}</p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Lowest</p>
                                <p className="text-2xl font-bold text-red-600">{stats.lowest}</p>
                            </div>
                            <div className="card p-4 text-center">
                                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Passing</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.passing}/{students.length}
                                </p>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Student
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Roll Number
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Score (out of {maxScore})
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Percentage
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Grade
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student, index) => {
                                            const score = marks.get(student.id) || 0;
                                            const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

                                            let grade = 'F';
                                            let gradeColor = 'text-red-600';
                                            if (percentage >= 90) { grade = 'A+'; gradeColor = 'text-green-600'; }
                                            else if (percentage >= 80) { grade = 'A'; gradeColor = 'text-green-500'; }
                                            else if (percentage >= 70) { grade = 'B'; gradeColor = 'text-blue-600'; }
                                            else if (percentage >= 60) { grade = 'C'; gradeColor = 'text-amber-600'; }
                                            else if (percentage >= 40) { grade = 'D'; gradeColor = 'text-orange-600'; }

                                            return (
                                                <tr
                                                    key={student.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                    style={{
                                                        borderBottom: index < students.length - 1 ? '1px solid var(--border)' : undefined,
                                                    }}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium gradient-primary">
                                                                {getStudentName(student).charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                                    {getStudentName(student)}
                                                                </p>
                                                                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                                                    {getStudentEmail(student)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4" style={{ color: 'var(--foreground)' }}>
                                                        {student.roll_no || student.rollNumber || '-'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center">
                                                            <input
                                                                type="number"
                                                                value={score}
                                                                onChange={(e) => handleMarkChange(student.id, parseInt(e.target.value) || 0)}
                                                                className="input w-24 text-center"
                                                                min={0}
                                                                max={maxScore}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center" style={{ color: 'var(--foreground)' }}>
                                                        {percentage.toFixed(1)}%
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`font-bold text-lg ${gradeColor}`}>{grade}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}