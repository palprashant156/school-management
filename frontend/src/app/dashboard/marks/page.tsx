'use client';

import { useEffect, useState } from 'react';
import { getMarks, createMark, getStudents } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MarksPage() {
    const [marksList, setMarksList] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [newMark, setNewMark] = useState({ student_id: '', subject: '', marks: '' });
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
            const [marksRes, studentsRes] = await Promise.all([
                getMarks(),
                getStudents()
            ]);
            setMarksList(marksRes.data);
            setStudents(studentsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMark({
                ...newMark,
                marks: parseInt(newMark.marks),
                student: { id: parseInt(newMark.student_id) }
            });
            setNewMark({ student_id: '', subject: '', marks: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to create mark', error);
        }
    };

    if (loading || !isAuthenticated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Marks Management</h1>

                {/* Create Mark Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add Marks</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            className="border p-2 rounded"
                            value={newMark.student_id}
                            onChange={(e) => setNewMark({ ...newMark, student_id: e.target.value })}
                            required
                        >
                            <option value="">Select Student</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.user?.username} ({s.roll_no})
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Subject"
                            className="border p-2 rounded"
                            value={newMark.subject}
                            onChange={(e) => setNewMark({ ...newMark, subject: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Marks"
                            className="border p-2 rounded"
                            value={newMark.marks}
                            onChange={(e) => setNewMark({ ...newMark, marks: e.target.value })}
                            required
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Add Marks
                        </button>
                    </form>
                </div>

                {/* Marks List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {marksList.map((mark) => (
                                <tr key={mark.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {mark.student?.user?.username} ({mark.student?.roll_no})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{mark.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{mark.marks}</td>
                                </tr>
                            ))}
                            {marksList.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No marks found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
