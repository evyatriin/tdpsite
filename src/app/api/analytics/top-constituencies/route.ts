import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/analytics/top-constituencies - Public endpoint for top constituencies
export async function GET() {
    try {
        const topConstituencies = await prisma.event.groupBy({
            by: ['constituency'],
            where: { status: 'APPROVED' },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        });

        return NextResponse.json({
            items: topConstituencies.map((item) => ({
                constituency: item.constituency,
                count: item._count.id,
            })),
        });
    } catch (error) {
        console.error('Error fetching top constituencies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch top constituencies' },
            { status: 500 }
        );
    }
}
