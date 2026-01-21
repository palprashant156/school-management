'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function DashboardPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
    // Mock Data for UI demonstration
    const stats = [
            { label: 'Total Users', value: '6', color: 'text-gray-900', subColor: 'text-gray-500' },
            { label: 'Students', value: '3', color: 'text-green-600', subColor: 'text-green-600' },
            { label: 'Teachers', value: '2', color: 'text-blue-600', subColor: 'text-blue-600' },
            { label: 'Admins', value: '1', color: 'text-purple-600', subColor: 'text-purple-600' },
        ];

    const usersList = [
            { id: 1, name: 'Dr. Sarah Williams', email: 'admin@school.edu', role: 'Admin', status: 'active', lastLogin: '1/20/2025', avatarBg: 'bg-purple-100', avatarText: 'text-purple-600' },
            { id: 2, name: 'John Martinez', email: 'john.teacher@school.edu', role: 'Teacher', status: 'active', lastLogin: '1/19/2025', avatarBg: 'bg-blue-100', avatarText: 'text-blue-600' },
            { id: 3, name: 'Emily Chen', email: 'emily.teacher@school.edu', role: 'Teacher', status: 'active', lastLogin: '1/20/2025', avatarBg: 'bg-blue-100', avatarText: 'text-blue-600' },
            { id: 4, name: 'Alice Johnson', email: 'alice.student@school.edu', role: 'Student', status: 'active', lastLogin: '1/19/2025', avatarBg: 'bg-indigo-100', avatarText: 'text-indigo-600' },
        ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
                <p className="mt-2 text-gray-500">Manage students, teachers, and administrators</p>
            </div>

            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-shadow"
                        placeholder="Search users..."
                    />
                </div>
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add User
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200">
                        <div className="p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                            <dd className={`mt-2 text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</dd>
                        </div>
                    </div>
                ))}
            </div>

            {/* User Table */}
            <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Login</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {usersList.map((person) => (
                                <tr key={person.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className={`h-10 w-10 rounded-full ${person.avatarBg} flex items-center justify-center`}>
                                                    <span className={`text-sm font-bold ${person.avatarText}`}>{person.name[0]}</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{person.name}</div>
                                                <div className="text-sm text-gray-500">{person.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${person.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                            person.role === 'Teacher' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {person.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {person.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {person.lastLogin}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
