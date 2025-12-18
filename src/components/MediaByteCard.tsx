'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import type { MediaByte } from '@/types';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/utils';

interface MediaByteCardProps {
    mediaByte: MediaByte;
}

export default function MediaByteCard({ mediaByte }: MediaByteCardProps) {
    const t = useTranslations('mediaBytes');

    const youtubeId = extractYouTubeId(mediaByte.videoUrl);
    const thumbnailUrl = youtubeId
        ? getYouTubeThumbnail(youtubeId)
        : '/placeholder-video.jpg';

    const mediaByteUrl = `/leader-speaks/${mediaByte.id}`;

    return (
        <article className="media-card">
            <Link href={mediaByteUrl} className="media-card-video">
                <img
                    src={thumbnailUrl}
                    alt={mediaByte.message || 'Media Byte'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="media-card-play">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </Link>

            <div className="media-card-content">
                {mediaByte.message && (
                    <p className="media-card-message">
                        {mediaByte.message.length > 100
                            ? `${mediaByte.message.substring(0, 100)}...`
                            : mediaByte.message}
                    </p>
                )}

                <div className="media-card-meta">
                    <span className="flex items-center gap-1">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        {mediaByte.viewCount.toLocaleString()} {t('views')}
                    </span>
                    <span>
                        {formatDistanceToNow(new Date(mediaByte.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </article>
    );
}
