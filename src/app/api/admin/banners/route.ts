import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';

// GET - Fetch all active banner images (public)
export async function GET() {
    try {
        const banners = await prisma.bannerImage.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({ items: banners });
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}

// POST - Create a new banner (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;
        const title = formData.get('title') as string | null;
        const link = formData.get('link') as string | null;
        const order = parseInt(formData.get('order') as string || '0');

        if (!imageFile) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        // Upload image
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await uploadFile(buffer, imageFile.name, 'banners');

        const banner = await prisma.bannerImage.create({
            data: {
                url: uploadResult.url,
                title: title || null,
                link: link || null,
                order,
                isActive: true,
            },
        });

        return NextResponse.json({ banner }, { status: 201 });
    } catch (error) {
        console.error('Error creating banner:', error);
        return NextResponse.json(
            { error: 'Failed to create banner' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a banner (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Banner ID required' }, { status: 400 });
        }

        await prisma.bannerImage.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting banner:', error);
        return NextResponse.json(
            { error: 'Failed to delete banner' },
            { status: 500 }
        );
    }
}

// PATCH - Update banner order or toggle active status (Admin only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, order, isActive, title, link } = body;

        if (!id) {
            return NextResponse.json({ error: 'Banner ID required' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (typeof order === 'number') updateData.order = order;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (title !== undefined) updateData.title = title;
        if (link !== undefined) updateData.link = link;

        const banner = await prisma.bannerImage.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ banner });
    } catch (error) {
        console.error('Error updating banner:', error);
        return NextResponse.json(
            { error: 'Failed to update banner' },
            { status: 500 }
        );
    }
}
