'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { LeaderProfile, User } from '@/types';

interface LeaderProfileData extends LeaderProfile {
    user: User;
}

interface LeaderDetailClientProps {
    leader: LeaderProfileData;
    stateCode: string;
}

export default function LeaderDetailClient({ leader, stateCode }: LeaderDetailClientProps) {
    const t = useTranslations('leaders');

    const socialLinks = leader.socialLinks as {
        youtube?: string;
        twitter?: string;
        facebook?: string;
        instagram?: string;
    } | null;

    return (
        <div className="leader-profile-page">
            <div className="leader-profile-header">
                <Link href="/leaders" className="back-link">
                    ← {t('backToLeaders')}
                </Link>
            </div>

            <div className="leader-profile-card">
                <div className="leader-profile-photo-section">
                    <img
                        src={leader.photoUrl || '/placeholder-leader.jpg'}
                        alt={leader.user.name}
                        className="leader-profile-photo"
                    />
                </div>

                <div className="leader-profile-info">
                    <h1 className="leader-profile-name">{leader.user.name}</h1>
                    <p className="leader-profile-designation">{leader.designation}</p>

                    {leader.constituency && (
                        <p className="leader-profile-constituency">
                            <strong>{t('constituency')}:</strong> {leader.constituency}
                        </p>
                    )}

                    {leader.user.state && (
                        <p className="leader-profile-state">
                            <strong>{t('state')}:</strong> {leader.user.state}
                        </p>
                    )}

                    {leader.bio && (
                        <div className="leader-profile-bio">
                            <h3>{t('bio')}</h3>
                            <p>{leader.bio}</p>
                        </div>
                    )}

                    {socialLinks && Object.keys(socialLinks).length > 0 && (
                        <div className="leader-profile-social">
                            <h3>{t('socialLinks')}</h3>
                            <div className="social-links-grid">
                                {socialLinks.youtube && (
                                    <a
                                        href={socialLinks.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link youtube"
                                    >
                                        YouTube
                                    </a>
                                )}
                                {socialLinks.twitter && (
                                    <a
                                        href={socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link twitter"
                                    >
                                        Twitter
                                    </a>
                                )}
                                {socialLinks.facebook && (
                                    <a
                                        href={socialLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link facebook"
                                    >
                                        Facebook
                                    </a>
                                )}
                                {socialLinks.instagram && (
                                    <a
                                        href={socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="social-link instagram"
                                    >
                                        Instagram
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
