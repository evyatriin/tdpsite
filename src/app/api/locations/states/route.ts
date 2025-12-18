import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/locations/states - List all states
export async function GET() {
    try {
        const states = await prisma.state.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ items: states });
    } catch (error) {
        console.error('Error fetching states:', error);
        return NextResponse.json(
            { error: 'Failed to fetch states' },
            { status: 500 }
        );
    }
}
