'use client';

import { useEffect, useState } from 'react';
import { getAttendance, createAttendance, getStudents } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AttendancePage() {
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [newAttendance, setNewAttendance] = useState({ student_id: '', attendance_date: '', status: 'Present' });
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
            const [attendanceRes, studentsRes] = await Promise.all([
                getAttendance(),
                getStudents()
            ]);
            setAttendanceList(attendanceRes.data);
            setStudents(studentsRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAttendance({
                ...newAttendance,
                student: { id: parseInt(newAttendance.student_id) }
            });
            setNewAttendance({ student_id: '', attendance_date: '', status: 'Present' });
            fetchData();
        } catch (error) {
            console.error('Failed to create attendance', error);
        }
    };

    if (loading || !isAuthenticated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Attendance Management</h1>

                {/* Create Attendance Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            className="border p-2 rounded"
                            value={newAttendance.student_id}
                            onChange={(e) => setNewAttendance({ ...newAttendance, student_id: e.target.value })}
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
                            type="date"
                            className="border p-2 rounded"
                            value={newAttendance.attendance_date}
                            onChange={(e) => setNewAttendance({ ...newAttendance, attendance_date: e.target.value })}
                            required
                        />
                        <select
                            className="border p-2 rounded"
                            value={newAttendance.status}
                            onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}
                            required
                        >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                        </select>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Mark Attendance
                        </button>
                    </form>
                </div>

                {/* Attendance List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceList.map((record) => (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(record.attendance_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {record.student?.user?.username} ({record.student?.roll_no})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                                record.status === 'Absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {attendanceList.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No attendance records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
