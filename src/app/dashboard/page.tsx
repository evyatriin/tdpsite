'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const t = useTranslations('nav');
    const tEvents = useTranslations('events');
    const tMediaBytes = useTranslations('mediaBytes');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const role = session.user.role;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="section-header">
                <h1 className="section-title">Welcome, {session.user.name}!</h1>
            </div>

            <div className="card mb-6">
                <div className="card-body">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold">
                            {session.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">{session.user.name}</h2>
                            <p className="text-gray-500">{session.user.mobile}</p>
                            <span className="badge badge-info mt-1">{role}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cadre Actions */}
                {role === 'CADRE' && (
                    <Link href="/cadre/events/new" className="card hover:shadow-xl transition-shadow">
                        <div className="card-body flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                    <line x1="12" y1="14" x2="12" y2="18" />
                                    <line x1="10" y1="16" x2="14" y2="16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">{tEvents('createEvent')}</h3>
                                <p className="text-sm text-gray-500">Post a new event with photos</p>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Leader Actions */}
                {role === 'LEADER' && (
                    <Link href="/leader/media-bytes/new" className="card hover:shadow-xl transition-shadow">
                        <div className="card-body flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                                    <polygon points="23 7 16 12 23 17 23 7" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold">{tMediaBytes('createMediaByte')}</h3>
                                <p className="text-sm text-gray-500">Share a video message</p>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Admin Actions */}
                {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                    <>
                        <Link href="/admin" className="card hover:shadow-xl transition-shadow">
                            <div className="card-body flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">{t('admin')}</h3>
                                    <p className="text-sm text-gray-500">Manage users, content, and settings</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/admin/analytics" className="card hover:shadow-xl transition-shadow">
                            <div className="card-body flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
                                        <line x1="18" y1="20" x2="18" y2="10" />
                                        <line x1="12" y1="20" x2="12" y2="4" />
                                        <line x1="6" y1="20" x2="6" y2="14" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Analytics</h3>
                                    <p className="text-sm text-gray-500">View dashboard and reports</p>
                                </div>
                            </div>
                        </Link>
                    </>
                )}

                {/* View Feed - All users */}
                <Link href="/" className="card hover:shadow-xl transition-shadow">
                    <div className="card-body flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold">View Feed</h3>
                            <p className="text-sm text-gray-500">Browse all events and activities</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
