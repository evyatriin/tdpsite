'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import type { Event } from '@/types';
import ShareButtons from './ShareButtons';

interface EventCardProps {
    event: Event;
    showShare?: boolean;
}

export default function EventCard({ event, showShare = true }: EventCardProps) {
    const t = useTranslations('events');
    const categoryLabels: Record<string, string> = {
        OUTREACH: t('categories.OUTREACH'),
        WELFARE: t('categories.WELFARE'),
        MEETING: t('categories.MEETING'),
        PROTEST: t('categories.PROTEST'),
        SOCIAL_SERVICE: t('categories.SOCIAL_SERVICE'),
    };

    const mainImage = event.images?.[0]?.url || '/placeholder-event.jpg';
    const eventUrl = `/events/${event.id}`;

    return (
        <article className="event-card">
            <Link href={eventUrl} className="event-card-image">
                <Image
                    src={mainImage}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                />
                <span className="event-card-category">
                    {categoryLabels[event.category] || event.category}
                </span>
            </Link>

            <div className="event-card-content">
                <Link href={eventUrl}>
                    <h3 className="event-card-title">{event.title}</h3>
                </Link>

                <div className="event-card-location">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>
                        {event.constituency}, {event.district}
                    </span>
                </div>

                <div className="event-card-meta">
                    <span>
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </span>
                    {showShare && (
                        <ShareButtons
                            url={`${process.env.NEXT_PUBLIC_APP_URL}${eventUrl}`}
                            title={event.title}
                            compact
                        />
                    )}
                </div>
            </div>
        </article>
    );
}
