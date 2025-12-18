import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import LeaderDetailClient from './LeaderDetailClient';

// Map state codes to full state names
const STATE_CODE_MAP: Record<string, string> = {
    'ap': 'Andhra Pradesh',
    'tg': 'Telangana',
};

interface PageProps {
    params: Promise<{
        state: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { state, slug } = await params;
    const stateName = STATE_CODE_MAP[state.toLowerCase()];

    if (!stateName) {
        return { title: 'Leader Not Found' };
    }

    const leader = await prisma.leaderProfile.findUnique({
        where: { slug },
        include: {
            user: {
                select: {
                    name: true,
                    state: true,
                },
            },
        },
    });

    if (!leader || leader.user.state !== stateName) {
        return { title: 'Leader Not Found' };
    }

    return {
        title: `${leader.user.name} | TDP Leader`,
        description: leader.bio || `Profile of ${leader.user.name}, ${leader.designation} from ${leader.constituency || stateName}`,
    };
}

export default async function LeaderDetailPage({ params }: PageProps) {
    const { state, slug } = await params;
    const stateCode = state.toLowerCase();
    const stateName = STATE_CODE_MAP[stateCode];

    if (!stateName) {
        notFound();
    }

    const leader = await prisma.leaderProfile.findUnique({
        where: { slug },
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
    });

    if (!leader || leader.user.state !== stateName) {
        notFound();
    }

    return <LeaderDetailClient leader={leader as any} stateCode={stateCode} />;
}
