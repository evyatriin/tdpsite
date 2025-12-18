import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFile, getSocialLinkThumbnail } from '@/lib/storage';

// GET /api/events - List events with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const state = searchParams.get('state');
        const district = searchParams.get('district');
        const constituency = searchParams.get('constituency');
        const category = searchParams.get('category');
        const status = searchParams.get('status') || 'APPROVED';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {
            status,
        };

        if (state) where.state = state;
        if (district) where.district = district;
        if (constituency) where.constituency = constituency;
        if (category) where.category = category;

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                    images: {
                        orderBy: { order: 'asc' },
                    },
                    socialLinks: true,
                    _count: {
                        select: { comments: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.event.count({ where }),
        ]);

        return NextResponse.json({
            items: events,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

// POST /api/events - Create a new event (Cadre only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a Cadre and can post
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || user.role !== 'CADRE') {
            return NextResponse.json(
                { error: 'Only Cadre members can create events' },
                { status: 403 }
            );
        }

        if (!user.canPost) {
            return NextResponse.json(
                { error: 'Your posting privileges have been disabled' },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const state = formData.get('state') as string;
        const district = formData.get('district') as string;
        const constituency = formData.get('constituency') as string;
        const language = formData.get('language') as string || 'en';

        // Validation
        if (!title || !category || !description || !state || !district || !constituency) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (description.length > 500) {
            return NextResponse.json(
                { error: 'Description must be 500 characters or less' },
                { status: 400 }
            );
        }

        // Check auto-approve setting
        const autoApproveSetting = await prisma.appSetting.findUnique({
            where: { key: 'auto_approve_posts' },
        });
        const autoApprove = autoApproveSetting?.value === 'true';

        // Create the event
        const event = await prisma.event.create({
            data: {
                title,
                category: category as 'OUTREACH' | 'WELFARE' | 'MEETING' | 'PROTEST' | 'SOCIAL_SERVICE',
                description,
                state,
                district,
                constituency,
                language,
                status: autoApprove ? 'APPROVED' : 'PENDING',
                userId: user.id,
            },
        });

        // Handle image uploads
        const imageFiles = formData.getAll('images') as File[];
        if (imageFiles.length > 0 && imageFiles.length <= 5) {
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                if (file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const { url } = await uploadFile(buffer, file.name, 'events');

                    await prisma.eventImage.create({
                        data: {
                            url,
                            order: i,
                            eventId: event.id,
                        },
                    });
                }
            }
        }

        // Handle social links
        const socialLinksJson = formData.get('socialLinks') as string;
        if (socialLinksJson) {
            try {
                const socialLinks = JSON.parse(socialLinksJson) as Array<{
                    platform: string;
                    url: string;
                }>;

                for (const link of socialLinks) {
                    if (link.url) {
                        const thumbnailUrl = getSocialLinkThumbnail(link.platform, link.url);
                        await prisma.socialLink.create({
                            data: {
                                platform: link.platform as 'YOUTUBE' | 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM',
                                url: link.url,
                                thumbnailUrl,
                                eventId: event.id,
                            },
                        });
                    }
                }
            } catch (e) {
                console.error('Error parsing social links:', e);
            }
        }

        // Fetch the complete event with relations
        const completeEvent = await prisma.event.findUnique({
            where: { id: event.id },
            include: {
                images: { orderBy: { order: 'asc' } },
                socialLinks: true,
                user: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ success: true, event: completeEvent }, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
        );
    }
}
