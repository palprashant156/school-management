'use client';

// =============================================================================
// USERS PAGE
// =============================================================================
// Users management page (Admin only) with role assignment and CRUD
// =============================================================================

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { User, Role } from '@/types';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Users,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Shield,
    ShieldCheck,
    ShieldX,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

// Helper to extract role name from union type
const getRoleName = (role: unknown): string | undefined => {
    if (!role) return undefined;
    if (typeof role === 'string') return role;
    if (typeof role === 'object' && role !== null && 'name' in role) {
        return (role as { name: string }).name;
    }
    return undefined;
};

// Helper to extract role id from union type
const getRoleId = (role: unknown): number | undefined => {
    if (!role) return undefined;
    if (typeof role === 'object' && role !== null && 'id' in role) {
        return (role as { id: number }).id;
    }
    return undefined;
};

interface UserFormData {
    username: string;
    email: string;
    password: string;
    roleId: string;
    isActive: boolean;
}

// -----------------------------------------------------------------------------
// Users Page Component
// -----------------------------------------------------------------------------

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        username: '',
        email: '',
        password: '',
        roleId: '',
        isActive: true,
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const itemsPerPage = 10;

    // Memoize isAdmin to prevent infinite re-render loop
    const isAdmin = useMemo(() => {
        return currentUser?.role === 'admin' || getRoleName(currentUser?.role) === 'admin';
    }, [currentUser?.role]);

    // ---------------------------------------------------------------------------
    // Fetch Data (hooks must be called before any conditional returns)
    // ---------------------------------------------------------------------------

    const fetchUsers = useCallback(async () => {
        try {
            const response = await api.get('/users');
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const response = await api.get('/roles');
            setRoles(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
            fetchRoles();
        } else {
            setLoading(false);
        }
    }, [isAdmin, fetchUsers, fetchRoles]);

    // ---------------------------------------------------------------------------
    // Filter and Paginate
    // ---------------------------------------------------------------------------

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || getRoleName(user.role) === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ---------------------------------------------------------------------------
    // Modal Handlers
    // ---------------------------------------------------------------------------

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            roleId: '',
            isActive: true,
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            password: '', // Don't pre-fill password
            roleId: getRoleId(user.role)?.toString() || '',
            isActive: user.isActive !== false,
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            roleId: '',
            isActive: true,
        });
        setFormError('');
    };

    // ---------------------------------------------------------------------------
    // Form Handlers
    // ---------------------------------------------------------------------------

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);

        try {
            const payload: Record<string, unknown> = {
                username: formData.username,
                email: formData.email,
                isActive: formData.isActive,
            };

            if (formData.roleId) {
                payload.roleId = formData.roleId;
            }

            if (formData.password) {
                payload.password = formData.password;
            } else if (!editingUser) {
                setFormError('Password is required for new users');
                setIsSubmitting(false);
                return;
            }

            if (editingUser) {
                await api.patch(`/users/${editingUser.id}`, payload);
            } else {
                await api.post('/users', payload);
            }

            await fetchUsers();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setFormError(err.response?.data?.message || 'Failed to save user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/users/${id}`);
            await fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const getRoleBadgeColor = (roleName: string | undefined) => {
        switch (roleName?.toLowerCase()) {
            case 'admin':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'teacher':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'student':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    // Access denied for non-admin users
    if (!isAdmin) {
        return (
            <DashboardLayout title="Users">
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <ShieldX size={64} className="text-red-400" />
                    <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                        Access Denied
                    </h2>
                    <p style={{ color: 'var(--foreground-muted)' }}>
                        You don&apos;t have permission to access this page.
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Users">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Users
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Manage system users and their roles
                        </p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <Plus size={18} />
                        Add User
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="card p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--foreground-muted)' }}
                            />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="input pl-10"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input w-auto"
                        >
                            <option value="all">All Roles</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="spinner mx-auto"></div>
                            <p className="mt-4" style={{ color: 'var(--foreground-muted)' }}>
                                Loading users...
                            </p>
                        </div>
                    ) : paginatedUsers.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users
                                size={48}
                                className="mx-auto mb-4"
                                style={{ color: 'var(--foreground-muted)' }}
                            />
                            <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                                No users found
                            </p>
                            <p style={{ color: 'var(--foreground-muted)' }}>
                                {searchQuery ? 'Try a different search query' : 'Add your first user'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                User
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Role
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
                                                style={{ color: 'var(--foreground-muted)' }}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedUsers.map((user, index) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                                style={{
                                                    borderBottom: index < paginatedUsers.length - 1 ? '1px solid var(--border)' : undefined,
                                                }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-br from-primary-500 to-primary-600">
                                                            {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                                                            {user.username || 'No username'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4" style={{ color: 'var(--foreground-muted)' }}>
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(getRoleName(user.role))}`}>
                                                        <Shield size={12} />
                                                        {getRoleName(user.role) || 'No Role'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.isActive !== false ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                            <ShieldCheck size={12} />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(user)}
                                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                            style={{ color: 'var(--foreground-muted)' }}
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id || user.userId || '')}
                                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t"
                                    style={{ borderColor: 'var(--border)' }}>
                                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                                        {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                                        {filteredUsers.length} results
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="px-3 py-1 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div
                        className="card w-full max-w-md p-6 animate-fade-in"
                        style={{ background: 'var(--background-secondary)' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600">
                                <AlertCircle size={18} />
                                <span className="text-sm">{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input"
                                    {...(!editingUser && { required: true })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Role
                                </label>
                                <select
                                    value={formData.roleId}
                                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                    className="input"
                                >
                                    <option value="">Select a role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <label htmlFor="isActive" className="text-sm" style={{ color: 'var(--foreground)' }}>
                                    Active account
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary flex-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="spinner"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        editingUser ? 'Save Changes' : 'Add User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
