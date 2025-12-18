import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import EventDetailClient from './EventDetailClient';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
        select: { title: true, description: true },
    });

    if (!event) return { title: 'Event Not Found' };

    return {
        title: `${event.title} | TDP`,
        description: event.description.substring(0, 160),
        openGraph: {
            title: event.title,
            description: event.description.substring(0, 160),
        },
    };
}

export default async function EventDetailPage({ params }: Props) {
    const { id } = await params;
    const t = await getTranslations('events');

    const event = await prisma.event.findUnique({
        where: { id, status: 'APPROVED' },
        include: {
            user: {
                select: { id: true, name: true },
            },
            images: {
                orderBy: { order: 'asc' },
            },
            socialLinks: true,
            comments: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!event) {
        notFound();
    }

    return <EventDetailClient event={event} />;
}
