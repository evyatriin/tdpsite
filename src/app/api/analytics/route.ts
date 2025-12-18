import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/analytics - Get analytics dashboard data
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Total events
        const totalEvents = await prisma.event.count({
            where: { status: 'APPROVED' },
        });

        // Events last 7 days
        const eventsLast7Days = await prisma.event.count({
            where: {
                status: 'APPROVED',
                createdAt: { gte: sevenDaysAgo },
            },
        });

        // Events last 30 days
        const eventsLast30Days = await prisma.event.count({
            where: {
                status: 'APPROVED',
                createdAt: { gte: thirtyDaysAgo },
            },
        });

        // Events by state
        const eventsByState = await prisma.event.groupBy({
            by: ['state'],
            where: { status: 'APPROVED' },
            _count: { id: true },
        });

        // Events by district
        const eventsByDistrict = await prisma.event.groupBy({
            by: ['district'],
            where: { status: 'APPROVED' },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 15,
        });

        // Events by category
        const eventsByCategory = await prisma.event.groupBy({
            by: ['category'],
            where: { status: 'APPROVED' },
            _count: { id: true },
        });

        // Top 10 constituencies
        const topConstituencies = await prisma.event.groupBy({
            by: ['constituency'],
            where: { status: 'APPROVED' },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10,
        });

        // Top 10 active cadres
        const topCadres = await prisma.user.findMany({
            where: { role: 'CADRE' },
            select: {
                id: true,
                name: true,
                district: true,
                constituency: true,
                _count: {
                    select: { events: true },
                },
            },
            orderBy: {
                events: { _count: 'desc' },
            },
            take: 10,
        });

        // Total media byte views
        const mediaByteViews = await prisma.mediaByte.aggregate({
            _sum: { viewCount: true },
        });

        // Events over time (last 30 days, grouped by day)
        const eventsOverTime = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "Event"
      WHERE status = 'APPROVED' AND created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    ` as Array<{ date: Date; count: bigint }>;

        return NextResponse.json({
            totalEvents,
            eventsLast7Days,
            eventsLast30Days,
            eventsByState: eventsByState.reduce((acc, item) => {
                acc[item.state] = item._count.id;
                return acc;
            }, {} as Record<string, number>),
            eventsByDistrict: eventsByDistrict.map((item) => ({
                district: item.district,
                count: item._count.id,
            })),
            eventsByCategory: eventsByCategory.reduce((acc, item) => {
                acc[item.category] = item._count.id;
                return acc;
            }, {} as Record<string, number>),
            topConstituencies: topConstituencies.map((item) => ({
                constituency: item.constituency,
                count: item._count.id,
            })),
            topCadres: topCadres.map((user) => ({
                id: user.id,
                name: user.name,
                district: user.district,
                constituency: user.constituency,
                eventCount: user._count.events,
            })),
            mediaByteViews: mediaByteViews._sum.viewCount || 0,
            eventsOverTime: eventsOverTime.map((item) => ({
                date: item.date.toISOString().split('T')[0],
                count: Number(item.count),
            })),
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
