import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadFile, extractYouTubeId } from '@/lib/storage';

// GET /api/media-bytes - List media bytes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const userId = searchParams.get('userId');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (userId) where.userId = userId;

        const [mediaBytes, total] = await Promise.all([
            prisma.mediaByte.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true },
                        include: {
                            leaderProfile: true,
                        },
                    } as any,
                    _count: {
                        select: { comments: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.mediaByte.count({ where }),
        ]);

        return NextResponse.json({
            items: mediaBytes,
            total,
            page,
            pageSize: limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Error fetching media bytes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch media bytes' },
            { status: 500 }
        );
    }
}

// POST /api/media-bytes - Create a new media byte (Leader only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || user.role !== 'LEADER') {
            return NextResponse.json(
                { error: 'Only Leaders can create media bytes' },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        const youtubeUrl = formData.get('youtubeUrl') as string;
        const videoFile = formData.get('video') as File | null;
        const message = formData.get('message') as string;
        const language = formData.get('language') as string || 'en';

        let videoUrl: string;
        let videoType: 'youtube' | 'upload' = 'youtube';

        // Either YouTube URL or video upload is required
        if (youtubeUrl) {
            const youtubeId = extractYouTubeId(youtubeUrl);
            if (!youtubeId) {
                return NextResponse.json(
                    { error: 'Invalid YouTube URL' },
                    { status: 400 }
                );
            }
            videoUrl = youtubeUrl;
            videoType = 'youtube';
        } else if (videoFile && videoFile.size > 0) {
            const buffer = Buffer.from(await videoFile.arrayBuffer());
            const { url } = await uploadFile(buffer, videoFile.name, 'media-bytes');
            videoUrl = url;
            videoType = 'upload';
        } else {
            return NextResponse.json(
                { error: 'Either YouTube URL or video file is required' },
                { status: 400 }
            );
        }

        const mediaByte = await prisma.mediaByte.create({
            data: {
                videoUrl,
                videoType,
                message: message || null,
                language,
                userId: user.id,
            },
            include: {
                user: {
                    select: { id: true, name: true },
                },
            },
        });

        return NextResponse.json({ success: true, mediaByte }, { status: 201 });
    } catch (error) {
        console.error('Error creating media byte:', error);
        return NextResponse.json(
            { error: 'Failed to create media byte' },
            { status: 500 }
        );
    }
}
