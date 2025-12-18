import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/settings - Get app settings
export async function GET() {
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

        const settings = await prisma.appSetting.findMany();

        // Convert to key-value object
        const settingsObject = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsObject);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/settings - Update app settings
export async function PUT(request: NextRequest) {
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
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json(
                { error: 'Key and value are required' },
                { status: 400 }
            );
        }

        // Allowed settings
        const allowedSettings = ['auto_approve_posts'];
        if (!allowedSettings.includes(key)) {
            return NextResponse.json(
                { error: 'Invalid setting key' },
                { status: 400 }
            );
        }

        // Upsert the setting
        const setting = await prisma.appSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
        });

        return NextResponse.json({ success: true, setting });
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json(
            { error: 'Failed to update setting' },
            { status: 500 }
        );
    }
}
