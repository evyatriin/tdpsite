import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/locations/districts - List districts by state
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const stateId = searchParams.get('stateId');

        if (!stateId) {
            return NextResponse.json(
                { error: 'stateId is required' },
                { status: 400 }
            );
        }

        const districts = await prisma.district.findMany({
            where: { stateId },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ items: districts });
    } catch (error) {
        console.error('Error fetching districts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch districts' },
            { status: 500 }
        );
    }
}
