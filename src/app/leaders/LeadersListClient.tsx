'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import LeaderCard from '@/components/LeaderCard';
import type { LeaderProfile, User } from '@/types';

interface LeaderWithUser extends LeaderProfile {
    user: User;
}

interface LeadersListClientProps {
    leaders: LeaderWithUser[];
}

const STATE_OPTIONS = [
    { value: '', label: 'All States' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh (AP)' },
    { value: 'Telangana', label: 'Telangana (TG)' },
];

export default function LeadersListClient({ leaders }: LeadersListClientProps) {
    const t = useTranslations('leaders');
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');

    const filteredLeaders = selectedState
        ? leaders.filter(leader => leader.user.state === selectedState)
        : leaders;

    const handleStateChange = (newState: string) => {
        setSelectedState(newState);
        const params = new URLSearchParams(searchParams.toString());
        if (newState) {
            params.set('state', newState);
        } else {
            params.delete('state');
        }
        router.push(`/leaders?${params.toString()}`);
    };

    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">{t('title')}</h1>
            </div>

            {/* State Filter Dropdown */}
            <div className="filter-section" style={{ marginBottom: '2rem' }}>
                <div className="filter-group">
                    <label htmlFor="state-filter" className="filter-label">
                        {t('filterByState')}
                    </label>
                    <select
                        id="state-filter"
                        className="filter-select"
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                    >
                        {STATE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {filteredLeaders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredLeaders.map((leader) => (
                        <LeaderCard key={leader.id} leader={leader as any} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <h3 className="empty-state-title">
                        {selectedState ? t('noLeadersInState') : t('noLeaders')}
                    </h3>
                </div>
            )}
        </div>
    );
}
