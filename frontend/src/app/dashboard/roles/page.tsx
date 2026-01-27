'use client';

// =============================================================================
// ROLES PAGE
// =============================================================================
// Roles management page (Admin only) with permissions
// =============================================================================

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Role, Permission } from '@/types';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Shield,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    ShieldX,
    Check,
} from 'lucide-react';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface RoleFormData {
    name: string;
    description: string;
    permissionIds: string[];
}

// -----------------------------------------------------------------------------
// Roles Page Component
// -----------------------------------------------------------------------------

export default function RolesPage() {
    const { user: currentUser } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<RoleFormData>({
        name: '',
        description: '',
        permissionIds: [],
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const itemsPerPage = 10;

    // Helper to extract role name from union type
    const getRoleName = useCallback((role: unknown): string | undefined => {
        if (!role) return undefined;
        if (typeof role === 'string') return role;
        if (typeof role === 'object' && role !== null && 'name' in role) {
            return (role as { name: string }).name;
        }
        return undefined;
    }, []);

    // Memoize isAdmin to prevent infinite re-render loop
    const isAdmin = useMemo(() => {
        return currentUser?.role === 'admin' || getRoleName(currentUser?.role) === 'admin';
    }, [currentUser?.role, getRoleName]);

    // ---------------------------------------------------------------------------
    // Fetch Data (hooks must be called before any conditional returns)
    // ---------------------------------------------------------------------------

    const fetchRoles = useCallback(async () => {
        try {
            const response = await api.get('/roles');
            setRoles(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPermissions = useCallback(async () => {
        try {
            // Try to get permissions from roles endpoint or a dedicated permissions endpoint
            const response = await api.get('/permissions');
            setPermissions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            // Permissions might not be available separately, that's ok
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchRoles();
            fetchPermissions();
        } else {
            setLoading(false);
        }
    }, [isAdmin, fetchRoles, fetchPermissions]);

    // ---------------------------------------------------------------------------
    // Filter and Paginate
    // ---------------------------------------------------------------------------

    const filteredRoles = roles.filter(
        (role) =>
            role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            role.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
    const paginatedRoles = filteredRoles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ---------------------------------------------------------------------------
    // Modal Handlers
    // ---------------------------------------------------------------------------

    const openAddModal = () => {
        setEditingRole(null);
        setFormData({
            name: '',
            description: '',
            permissionIds: [],
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissionIds: role.permissions?.map(p => p.id.toString()) || [],
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        setFormData({
            name: '',
            description: '',
            permissionIds: [],
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
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                permissionIds: formData.permissionIds.length > 0
                    ? formData.permissionIds.map(id => parseInt(id))
                    : undefined,
            };

            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, payload);
            } else {
                await api.post('/roles', payload);
            }

            await fetchRoles();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setFormError(err.response?.data?.message || 'Failed to save role');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this role? Users with this role will lose their permissions.')) return;

        try {
            await api.delete(`/roles/${id}`);
            await fetchRoles();
        } catch (error) {
            console.error('Failed to delete role:', error);
        }
    };

    const togglePermission = (permissionId: string) => {
        setFormData(prev => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(permissionId)
                ? prev.permissionIds.filter(id => id !== permissionId)
                : [...prev.permissionIds, permissionId]
        }));
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName.toLowerCase()) {
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
            <DashboardLayout title="Roles">
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
        <DashboardLayout title="Roles">
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                            Roles & Permissions
                        </h1>
                        <p style={{ color: 'var(--foreground-muted)' }}>
                            Manage roles and their permissions
                        </p>
                    </div>
                    <button onClick={openAddModal} className="btn btn-primary">
                        <Plus size={18} />
                        Add Role
                    </button>
                </div>

                {/* Search */}
                <div className="card p-4">
                    <div className="relative max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--foreground-muted)' }}
                        />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input pl-10"
                        />
                    </div>
                </div>

                {/* Roles Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full p-8 text-center">
                            <div className="spinner mx-auto"></div>
                            <p className="mt-4" style={{ color: 'var(--foreground-muted)' }}>
                                Loading roles...
                            </p>
                        </div>
                    ) : paginatedRoles.length === 0 ? (
                        <div className="col-span-full p-8 text-center">
                            <Shield
                                size={48}
                                className="mx-auto mb-4"
                                style={{ color: 'var(--foreground-muted)' }}
                            />
                            <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
                                No roles found
                            </p>
                            <p style={{ color: 'var(--foreground-muted)' }}>
                                {searchQuery ? 'Try a different search query' : 'Add your first role'}
                            </p>
                        </div>
                    ) : (
                        paginatedRoles.map((role) => (
                            <div key={role.id} className="card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getRoleBadgeColor(role.name)}`}>
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold capitalize" style={{ color: 'var(--foreground)' }}>
                                                {role.name}
                                            </h3>
                                            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                                {role.description || 'No description'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(role)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            style={{ color: 'var(--foreground-muted)' }}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(role.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                                        style={{ color: 'var(--foreground-muted)' }}>
                                        Permissions ({role.permissions?.length || 0})
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions && role.permissions.length > 0 ? (
                                            role.permissions.slice(0, 5).map((perm) => (
                                                <span
                                                    key={perm.id}
                                                    className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800"
                                                    style={{ color: 'var(--foreground-muted)' }}
                                                >
                                                    {perm.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                                No permissions assigned
                                            </span>
                                        )}
                                        {role.permissions && role.permissions.length > 5 && (
                                            <span className="px-2 py-0.5 rounded text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                                +{role.permissions.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
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
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div
                        className="card w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
                        style={{ background: 'var(--background-secondary)' }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                                {editingRole ? 'Edit Role' : 'Add New Role'}
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
                                    Role Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="e.g., admin, teacher, student"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="input min-h-[80px]"
                                    placeholder="Role description..."
                                />
                            </div>

                            {permissions.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                                        Permissions
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-3 rounded-lg border"
                                        style={{ borderColor: 'var(--border)' }}>
                                        {permissions.map((permission) => (
                                            <button
                                                key={permission.id}
                                                type="button"
                                                onClick={() => togglePermission(permission.id.toString())}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${formData.permissionIds.includes(permission.id.toString())
                                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                {formData.permissionIds.includes(permission.id.toString()) && (
                                                    <Check size={14} />
                                                )}
                                                <span>{permission.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                        editingRole ? 'Save Changes' : 'Add Role'
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
