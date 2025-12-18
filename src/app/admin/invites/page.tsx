'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface InviteCode {
    id: string;
    code: string;
    role: string;
    used: boolean;
    expiresAt: string | null;
    createdAt: string;
    createdBy: { id: string; name: string };
    usedBy?: { id: string; name: string };
}

export default function InvitesPage() {
    const t = useTranslations('admin');
    const [invites, setInvites] = useState<InviteCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUsed, setShowUsed] = useState<string>('');
    const [generating, setGenerating] = useState(false);
    const [newInviteRole, setNewInviteRole] = useState('CADRE');

    const fetchInvites = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (showUsed) params.append('used', showUsed);

        fetch(`/api/admin/invites?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                setInvites(data.items || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching invites:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchInvites();
    }, [showUsed]);

    const generateInvite = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/admin/invites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newInviteRole, expiresInDays: 30 }),
            });

            if (res.ok) {
                fetchInvites();
            }
        } catch (error) {
            console.error('Error generating invite:', error);
        } finally {
            setGenerating(false);
        }
    };

    const deleteInvite = async (inviteId: string) => {
        if (!confirm('Are you sure you want to delete this invite code?')) return;

        try {
            await fetch(`/api/admin/invites?id=${inviteId}`, { method: 'DELETE' });
            fetchInvites();
        } catch (error) {
            console.error('Error deleting invite:', error);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        alert('Code copied to clipboard!');
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">{t('invites')}</h1>

            {/* Generate New Invite */}
            <div className="card mb-6">
                <div className="card-header">
                    <h3 className="font-semibold">{t('generateInvite')}</h3>
                </div>
                <div className="card-body">
                    <div className="flex gap-4 items-end">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">{t('role')}</label>
                            <select
                                className="form-select"
                                value={newInviteRole}
                                onChange={(e) => setNewInviteRole(e.target.value)}
                            >
                                <option value="CADRE">Cadre</option>
                                <option value="LEADER">Leader</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <button
                            onClick={generateInvite}
                            className="btn btn-primary"
                            disabled={generating}
                        >
                            {generating ? 'Generating...' : t('generateInvite')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    className="filter-select"
                    value={showUsed}
                    onChange={(e) => setShowUsed(e.target.value)}
                >
                    <option value="">All Codes</option>
                    <option value="false">Unused</option>
                    <option value="true">Used</option>
                </select>
            </div>

            {/* Invites Table */}
            <div className="card">
                <div className="card-body" style={{ overflowX: 'auto' }}>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>{t('role')}</th>
                                    <th>{t('status')}</th>
                                    <th>Created By</th>
                                    <th>Used By</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invites.map((invite) => (
                                    <tr key={invite.id}>
                                        <td>
                                            <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                                                {invite.code}
                                            </code>
                                        </td>
                                        <td>
                                            <span className={`badge ${invite.role === 'ADMIN' ? 'badge-error' :
                                                    invite.role === 'LEADER' ? 'badge-info' : 'badge-success'
                                                }`}>
                                                {invite.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${invite.used ? 'badge-warning' : 'badge-success'}`}>
                                                {invite.used ? 'Used' : 'Available'}
                                            </span>
                                        </td>
                                        <td>{invite.createdBy.name}</td>
                                        <td>{invite.usedBy?.name || '-'}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(invite.code)}
                                                    className="btn btn-sm btn-ghost"
                                                    title="Copy code"
                                                >
                                                    📋
                                                </button>
                                                {!invite.used && (
                                                    <button
                                                        onClick={() => deleteInvite(invite.id)}
                                                        className="btn btn-sm btn-ghost"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
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
