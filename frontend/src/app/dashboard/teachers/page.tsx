'use client';

import { useEffect, useState } from 'react';
import { getTeachers, createTeacher } from '@/lib/api';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [newTeacher, setNewTeacher] = useState({ subject: '', user_id: '' });
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
            const [teachersRes, usersRes] = await Promise.all([
                getTeachers(),
                api.get('/users')
            ]);
            setTeachers(teachersRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createTeacher({
                ...newTeacher,
                user: { id: parseInt(newTeacher.user_id) }
            });
            setNewTeacher({ subject: '', user_id: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to create teacher', error);
        }
    };

    if (loading || !isAuthenticated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Teachers Management</h1>

                {/* Create Teacher Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add New Teacher</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Subject"
                            className="border p-2 rounded"
                            value={newTeacher.subject}
                            onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                            required
                        />
                        <select
                            className="border p-2 rounded"
                            value={newTeacher.user_id}
                            onChange={(e) => setNewTeacher({ ...newTeacher, user_id: e.target.value })}
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
                            Add Teacher
                        </button>
                    </form>
                </div>

                {/* Teachers List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teachers.map((teacher) => (
                                <tr key={teacher.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{teacher.user?.username || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{teacher.subject}</td>
                                </tr>
                            ))}
                            {teachers.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-center text-gray-500">No teachers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
