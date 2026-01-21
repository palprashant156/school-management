'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">Manage your account settings</p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user?.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user?.isActive !== false ? 'Active Account' : 'Suspended'}
                    </span>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center space-x-6">
                        <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold">
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{user?.username}</h2>
                            <p className="text-gray-500">{user?.email}</p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                <span className="mr-2">Role:</span>
                                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium capitalize">
                                    {user?.role || 'User'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded text-gray-900">
                                {user?.username}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded text-gray-900">
                                {user?.email}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">User ID</label>
                            <div className="mt-1 p-2 w-full bg-gray-50 border border-gray-200 rounded text-gray-500 text-sm font-mono">
                                {user?.id}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
