import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/media-bytes/[id] - Get single media byte (increments view count)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Increment view count
        const mediaByte = await prisma.mediaByte.update({
            where: { id },
            data: {
                viewCount: { increment: 1 },
            },
            include: {
                user: {
                    select: { id: true, name: true },
                    include: {
                        leaderProfile: true,
                    } as any,
                },
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

        if (!mediaByte) {
            return NextResponse.json({ error: 'Media byte not found' }, { status: 404 });
        }

        return NextResponse.json(mediaByte);
    } catch (error) {
        console.error('Error fetching media byte:', error);
        return NextResponse.json(
            { error: 'Failed to fetch media byte' },
            { status: 500 }
        );
    }
}

// DELETE /api/media-bytes/[id] - Delete media byte (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Only administrators can delete media bytes' },
                { status: 403 }
            );
        }

        const { id } = await params;

        await prisma.mediaByte.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting media byte:', error);
        return NextResponse.json(
            { error: 'Failed to delete media byte' },
            { status: 500 }
        );
    }
}
