'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || user?.role !== 'admin') {
                router.push('/dashboard');
            } else {
                fetchRoles();
            }
        }
    }, [loading, isAuthenticated, user, router]);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles', error);
        }
    };

    if (loading || !isAuthenticated || user?.role !== 'admin') {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Roles & Permissions</h1>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {roles.map((role) => (
                            <li key={role.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-lg font-medium text-gray-900">{role.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {role.permissions?.map((p: any) => p.name).join(', ')}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
