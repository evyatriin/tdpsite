import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import LeaderCard from '@/components/LeaderCard';

export const metadata = {
    title: 'Our Leaders | TDP',
    description: 'Meet the verified leaders of Telugu Desam Party across Andhra Pradesh and Telangana.',
};

export default async function LeadersPage() {
    const t = await getTranslations('leaders');

    const leaders = await prisma.leaderProfile.findMany({
        where: { isVerified: true },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    mobile: true,
                    role: true,
                    state: true,
                    district: true,
                    constituency: true,
                    isActive: true,
                    canPost: true,
                    createdAt: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <div className="section-header">
                <h1 className="section-title">{t('title')}</h1>
            </div>

            {leaders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {leaders.map((leader) => (
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
                    <h3 className="empty-state-title">No leaders found</h3>
                </div>
            )}
        </div>
    );
}
