'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface QuickStats {
    totalEvents: number;
    totalUsers: number;
    pendingEvents: number;
    totalMediaBytes: number;
}

export default function AdminDashboardPage() {
    const t = useTranslations('admin');
    const [stats, setStats] = useState<QuickStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch quick stats
        Promise.all([
            fetch('/api/events?limit=1').then(r => r.json()),
            fetch('/api/admin/users?limit=1').then(r => r.json()),
            fetch('/api/events?status=PENDING&limit=1').then(r => r.json()),
            fetch('/api/media-bytes?limit=1').then(r => r.json()),
        ]).then(([events, users, pending, mediaBytes]) => {
            setStats({
                totalEvents: events.total || 0,
                totalUsers: users.total || 0,
                pendingEvents: pending.total || 0,
                totalMediaBytes: mediaBytes.total || 0,
            });
            setLoading(false);
        }).catch(err => {
            console.error('Error fetching stats:', err);
            setLoading(false);
        });
    }, []);

    const quickActions = [
        { href: '/admin/invites', label: 'Generate Invite', icon: '✉️', color: 'bg-blue-100' },
        { href: '/admin/users', label: 'Manage Users', icon: '👥', color: 'bg-green-100' },
        { href: '/admin/moderation', label: 'Review Content', icon: '📋', color: 'bg-yellow-100' },
        { href: '/admin/analytics', label: 'View Analytics', icon: '📊', color: 'bg-purple-100' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

            {/* Quick Stats */}
            <div className="stats-grid mb-8">
                <div className="stat-card">
                    <div className="stat-value">{loading ? '...' : stats?.totalEvents || 0}</div>
                    <div className="stat-label">Total Events</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{loading ? '...' : stats?.totalUsers || 0}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{loading ? '...' : stats?.pendingEvents || 0}</div>
                    <div className="stat-label">Pending Review</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{loading ? '...' : stats?.totalMediaBytes || 0}</div>
                    <div className="stat-label">Media Bytes</div>
                </div>
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="card hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body flex items-center gap-3">
                            <span className={`text-2xl ${action.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                                {action.icon}
                            </span>
                            <span className="font-medium">{action.label}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
