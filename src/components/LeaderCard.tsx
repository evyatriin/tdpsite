'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { LeaderProfile, User } from '@/types';

interface LeaderCardProps {
    leader: LeaderProfile & { user: User };
}

// Convert state name to URL code
function getStateCode(state?: string): string {
    if (!state) return 'ap'; // Default to AP
    const stateMap: Record<string, string> = {
        'Andhra Pradesh': 'ap',
        'Telangana': 'tg',
    };
    return stateMap[state] || 'ap';
}

export default function LeaderCard({ leader }: LeaderCardProps) {
    const t = useTranslations('leaders');
    const stateCode = getStateCode(leader.user.state);

    return (
        <article className="leader-card">
            <img
                src={leader.photoUrl || '/placeholder-leader.jpg'}
                alt={leader.user.name}
                className="leader-card-photo"
            />

            <h3 className="leader-card-name">{leader.user.name}</h3>
            <p className="leader-card-designation">{leader.designation}</p>
            {leader.constituency && (
                <p className="leader-card-constituency">{leader.constituency}</p>
            )}
            {leader.user.state && (
                <p className="leader-card-state">{leader.user.state}</p>
            )}

            <Link
                href={`/leaders/${stateCode}/${leader.slug}`}
                className="btn btn-primary mt-4"
                style={{ display: 'inline-block' }}
            >
                {t('viewProfile')}
            </Link>
        </article>
    );
}
