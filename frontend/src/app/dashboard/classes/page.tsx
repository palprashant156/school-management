'use client';

import { useEffect, useState } from 'react';
import { getClasses, createClass } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [newClass, setNewClass] = useState({ class_name: '', section: '' });
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else {
                fetchClasses();
            }
        }
    }, [loading, isAuthenticated, router]);

    const fetchClasses = async () => {
        try {
            const response = await getClasses();
            setClasses(response.data);
        } catch (error) {
            console.error('Failed to fetch classes', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createClass(newClass);
            setNewClass({ class_name: '', section: '' });
            fetchClasses();
        } catch (error) {
            console.error('Failed to create class', error);
        }
    };

    if (loading || !isAuthenticated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Classes Management</h1>

                {/* Create Class Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add New Class</h2>
                    <form onSubmit={handleSubmit} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Class Name (e.g. 10)"
                            className="border p-2 rounded flex-1"
                            value={newClass.class_name}
                            onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Section (e.g. A)"
                            className="border p-2 rounded flex-1"
                            value={newClass.section}
                            onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
                            required
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Add Class
                        </button>
                    </form>
                </div>

                {/* Classes List */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {classes.map((cls) => (
                            <li key={cls.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-medium text-gray-900">Class {cls.class_name} - {cls.section}</div>
                                </div>
                            </li>
                        ))}
                        {classes.length === 0 && (
                            <li className="px-6 py-4 text-gray-500 text-center">No classes found.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
