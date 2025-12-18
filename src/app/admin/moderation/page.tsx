'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import type { Event } from '@/types';

export default function ModerationPage() {
    const t = useTranslations('admin');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);
    const [statusFilter, setStatusFilter] = useState('PENDING');

    const fetchEvents = () => {
        setLoading(true);
        fetch(`/api/events?status=${statusFilter}&limit=50`)
            .then((res) => res.json())
            .then((data) => {
                setEvents(data.items || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching events:', err);
                setLoading(false);
            });
    };

    const fetchSettings = () => {
        fetch('/api/admin/settings')
            .then((res) => res.json())
            .then((data) => {
                setAutoApprove(data.auto_approve_posts === 'true');
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchEvents();
        fetchSettings();
    }, [statusFilter]);

    const updateEventStatus = async (eventId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await fetch(`/api/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchEvents();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const deleteEvent = async (eventId: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const toggleAutoApprove = async () => {
        try {
            await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'auto_approve_posts',
                    value: (!autoApprove).toString(),
                }),
            });
            setAutoApprove(!autoApprove);
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">{t('contentModeration')}</h1>

            {/* Settings */}
            <div className="card mb-6">
                <div className="card-body flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">{t('autoApprove')}</h3>
                        <p className="text-sm text-gray-500">When enabled, new posts are automatically approved</p>
                    </div>
                    <button
                        onClick={toggleAutoApprove}
                        className={`btn ${autoApprove ? 'btn-primary' : 'btn-outline'}`}
                    >
                        {autoApprove ? 'ON' : 'OFF'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Events List */}
            {loading ? (
                <div className="text-center py-8">Loading...</div>
            ) : events.length > 0 ? (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="card">
                            <div className="card-body">
                                <div className="flex gap-4">
                                    {event.images?.[0] && (
                                        <img
                                            src={event.images[0].url}
                                            alt={event.title}
                                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold">{event.title}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {event.constituency}, {event.district} • {event.user?.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <span className={`badge ${event.status === 'APPROVED' ? 'badge-success' :
                                                    event.status === 'REJECTED' ? 'badge-error' : 'badge-warning'
                                                }`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-2 text-gray-700 line-clamp-2">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4 justify-end">
                                    <a
                                        href={`/events/${event.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-ghost"
                                    >
                                        View
                                    </a>
                                    {event.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => updateEventStatus(event.id, 'APPROVED')}
                                                className="btn btn-sm btn-primary"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => updateEventStatus(event.id, 'REJECTED')}
                                                className="btn btn-sm btn-outline"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="btn btn-sm"
                                        style={{ background: 'var(--color-error)', color: 'white' }}
                                    >
                                        {t('deleteContent')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <h3 className="empty-state-title">No {statusFilter.toLowerCase()} events</h3>
                </div>
            )}
        </div>
    );
}
