import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/comments - List comments for an event or media byte
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const mediaByteId = searchParams.get('mediaByteId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        if (!eventId && !mediaByteId) {
            return NextResponse.json(
                { error: 'Either eventId or mediaByteId is required' },
                { status: 400 }
            );
        }

        const where: Record<string, unknown> = {};
        if (eventId) where.eventId = eventId;
        if (mediaByteId) where.mediaByteId = mediaByteId;

        const [comments, total] = await Promise.all([
            prisma.comment.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.comment.count({ where }),
        ]);

        return NextResponse.json({
            items: comments,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST /api/comments - Add a comment (Cadre and Leader only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only Cadre and Leader can comment
        if (user.role !== 'CADRE' && user.role !== 'LEADER') {
            return NextResponse.json(
                { error: 'Only Cadre and Leader can comment' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { content, eventId, mediaByteId } = body;

        if (!content || content.trim() === '') {
            return NextResponse.json(
                { error: 'Comment content is required' },
                { status: 400 }
            );
        }

        if (!eventId && !mediaByteId) {
            return NextResponse.json(
                { error: 'Either eventId or mediaByteId is required' },
                { status: 400 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: user.id,
                eventId: eventId || null,
                mediaByteId: mediaByteId || null,
            },
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
        });

        return NextResponse.json({ success: true, comment }, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}

// DELETE /api/comments - Delete a comment (Admin only)
export async function DELETE(request: NextRequest) {
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
                { error: 'Only administrators can delete comments' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('id');

        if (!commentId) {
            return NextResponse.json(
                { error: 'Comment ID is required' },
                { status: 400 }
            );
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
