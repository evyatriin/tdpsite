import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/locations/constituencies - List constituencies by district
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const districtId = searchParams.get('districtId');

        if (!districtId) {
            return NextResponse.json(
                { error: 'districtId is required' },
                { status: 400 }
            );
        }

        const constituencies = await prisma.constituency.findMany({
            where: { districtId },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ items: constituencies });
    } catch (error) {
        console.error('Error fetching constituencies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch constituencies' },
            { status: 500 }
        );
    }
}
