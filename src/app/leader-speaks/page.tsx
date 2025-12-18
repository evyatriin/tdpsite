'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import MediaByteCard from '@/components/MediaByteCard';
import type { MediaByte } from '@/types';

export default function LeaderSpeaksPage() {
    const t = useTranslations('mediaBytes');
    const tCommon = useTranslations('common');

    const [mediaBytes, setMediaBytes] = useState<MediaByte[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetch(`/api/media-bytes?page=${page}&limit=12`)
            .then((res) => res.json())
            .then((data) => {
                setMediaBytes(data.items || []);
                setTotalPages(data.totalPages || 1);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching media bytes:', error);
                setLoading(false);
            });
    }, [page]);

    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">{t('title')}</h1>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card">
                            <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                            <div className="p-4">
                                <div className="skeleton" style={{ height: '60px', marginBottom: '8px' }} />
                                <div className="skeleton" style={{ height: '20px', width: '50%' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : mediaBytes.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mediaBytes.map((mb) => (
                            <MediaByteCard key={mb.id} mediaByte={mb} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="btn btn-outline btn-sm"
                            >
                                Previous
                            </button>
                            <span className="flex items-center px-4">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="btn btn-outline btn-sm"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <h3 className="empty-state-title">{t('noMediaBytes')}</h3>
                </div>
            )}
        </div>
    );
}
