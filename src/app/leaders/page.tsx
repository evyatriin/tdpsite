import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import LeadersListClient from './LeadersListClient';

export const metadata = {
    title: 'Our Leaders | TDP',
    description: 'Meet the verified leaders of Telugu Desam Party across Andhra Pradesh and Telangana.',
};

export default async function LeadersPage() {
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

    return <LeadersListClient leaders={leaders as any} />;
}
