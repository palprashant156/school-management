'use client';

import { useEffect, useState } from 'react';
import { getStudents, createStudent, getClasses } from '@/lib/api';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [newStudent, setNewStudent] = useState({ roll_no: '', user_id: '', class_id: '' });
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else {
                fetchData();
            }
        }
    }, [loading, isAuthenticated, router]);

    const fetchData = async () => {
        try {
            const [studentsRes, classesRes, usersRes] = await Promise.all([
                getStudents(),
                getClasses(),
                api.get('/users')
            ]);
            setStudents(studentsRes.data);
            setClasses(classesRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createStudent({
                ...newStudent,
                user: { id: parseInt(newStudent.user_id) },
                class: { id: parseInt(newStudent.class_id) }
            });
            setNewStudent({ roll_no: '', user_id: '', class_id: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to create student', error);
        }
    };

    if (loading || !isAuthenticated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Students Management</h1>

                {/* Create Student Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Roll No"
                            className="border p-2 rounded"
                            value={newStudent.roll_no}
                            onChange={(e) => setNewStudent({ ...newStudent, roll_no: e.target.value })}
                            required
                        />
                        <select
                            className="border p-2 rounded"
                            value={newStudent.class_id}
                            onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value })}
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.class_name} - {cls.section}
                                </option>
                            ))}
                        </select>
                        <select
                            className="border p-2 rounded"
                            value={newStudent.user_id}
                            onChange={(e) => setNewStudent({ ...newStudent, user_id: e.target.value })}
                            required
                        >
                            <option value="">Select User</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.username} ({u.email})
                                </option>
                            ))}
                        </select>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Add Student
                        </button>
                    </form>
                </div>

                {/* Students List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.roll_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{student.user?.username || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {student.class ? `${student.class.class_name} - ${student.class.section}` : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No students found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
