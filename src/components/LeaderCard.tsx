'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { LeaderProfile, User } from '@/types';

interface LeaderCardProps {
    leader: LeaderProfile & { user: User };
}

export default function LeaderCard({ leader }: LeaderCardProps) {
    const t = useTranslations('leaders');

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

            <Link
                href={`/leaders/${leader.id}`}
                className="btn btn-primary mt-4"
                style={{ display: 'inline-block' }}
            >
                {t('viewProfile')}
            </Link>
        </article>
    );
}
