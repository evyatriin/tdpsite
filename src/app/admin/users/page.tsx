'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface User {
    id: string;
    name: string;
    mobile: string;
    role: string;
    state: string | null;
    district: string | null;
    constituency: string | null;
    isActive: boolean;
    canPost: boolean;
    _count: {
        events: number;
        mediaBytes: number;
        comments: number;
    };
}

export default function UsersPage() {
    const t = useTranslations('admin');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ role: '', isActive: '' });

    const fetchUsers = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filter.role) params.append('role', filter.role);
        if (filter.isActive) params.append('isActive', filter.isActive);

        fetch(`/api/admin/users?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setUsers(data.items || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching users:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const toggleCanPost = async (userId: string, currentValue: boolean) => {
        try {
            await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, canPost: !currentValue }),
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const toggleActive = async (userId: string, currentValue: boolean) => {
        try {
            await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, isActive: !currentValue }),
            });
            fetchUsers();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">{t('userManagement')}</h1>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    className="filter-select"
                    value={filter.role}
                    onChange={(e) => setFilter({ ...filter, role: e.target.value })}
                >
                    <option value="">All Roles</option>
                    <option value="CADRE">Cadre</option>
                    <option value="LEADER">Leader</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <select
                    className="filter-select"
                    value={filter.isActive}
                    onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}
                >
                    <option value="">All Status</option>
                    <option value="true">{t('active')}</option>
                    <option value="false">{t('inactive')}</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="card-body" style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>{t('role')}</th>
                                    <th>Location</th>
                                    <th>{t('status')}</th>
                                    <th>Events</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="font-medium">{user.name}</td>
                                        <td>{user.mobile}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'ADMIN' ? 'badge-error' :
                                                    user.role === 'LEADER' ? 'badge-info' : 'badge-success'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="text-sm text-gray-500">
                                            {[user.constituency, user.district, user.state]
                                                .filter(Boolean)
                                                .join(', ') || '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                                                {user.isActive ? t('active') : t('inactive')}
                                            </span>
                                        </td>
                                        <td>{user._count.events}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleCanPost(user.id, user.canPost)}
                                                    className={`btn btn-sm ${user.canPost ? 'btn-outline' : 'btn-primary'}`}
                                                >
                                                    {user.canPost ? t('disablePosting') : t('enablePosting')}
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(user.id, user.isActive)}
                                                    className="btn btn-sm btn-ghost"
                                                >
                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
