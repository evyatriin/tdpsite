import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

// GET /api/admin/invites - List invite codes
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

        const { searchParams } = new URL(request.url);
        const used = searchParams.get('used');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (used === 'true') where.used = true;
        if (used === 'false') where.used = false;

        const [invites, total] = await Promise.all([
            prisma.inviteCode.findMany({
                where,
                include: {
                    createdBy: {
                        select: { id: true, name: true },
                    },
                    usedBy: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.inviteCode.count({ where }),
        ]);

        return NextResponse.json({
            items: invites,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching invites:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invites' },
            { status: 500 }
        );
    }
}

// POST /api/admin/invites - Generate new invite code
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { role, expiresInDays } = body;

        if (!role || !['CADRE', 'LEADER', 'ADMIN'].includes(role)) {
            return NextResponse.json(
                { error: 'Valid role is required (CADRE, LEADER, or ADMIN)' },
                { status: 400 }
            );
        }

        // Only SUPER_ADMIN can create ADMIN invites
        if (role === 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Only Super Admin can create Admin invites' },
                { status: 403 }
            );
        }

        // Generate unique code
        const code = uuidv4().substring(0, 8).toUpperCase();

        // Calculate expiry date
        let expiresAt: Date | null = null;
        if (expiresInDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
        }

        const invite = await prisma.inviteCode.create({
            data: {
                code,
                role,
                createdById: user.id,
                expiresAt,
            },
        });

        return NextResponse.json({ success: true, invite }, { status: 201 });
    } catch (error) {
        console.error('Error creating invite:', error);
        return NextResponse.json(
            { error: 'Failed to create invite' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/invites - Delete unused invite code
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
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const inviteId = searchParams.get('id');

        if (!inviteId) {
            return NextResponse.json(
                { error: 'Invite ID is required' },
                { status: 400 }
            );
        }

        // Only delete unused invites
        const invite = await prisma.inviteCode.findUnique({
            where: { id: inviteId },
        });

        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        if (invite.used) {
            return NextResponse.json(
                { error: 'Cannot delete used invite codes' },
                { status: 400 }
            );
        }

        await prisma.inviteCode.delete({
            where: { id: inviteId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting invite:', error);
        return NextResponse.json(
            { error: 'Failed to delete invite' },
            { status: 500 }
        );
    }
}
