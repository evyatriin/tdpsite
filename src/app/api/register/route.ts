import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// POST /api/register - Register with invite code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, mobile, password, inviteCode, state, district, constituency } = body;

        // Validation
        if (!name || !mobile || !password || !inviteCode) {
            return NextResponse.json(
                { error: 'Name, mobile, password, and invite code are required' },
                { status: 400 }
            );
        }

        // Validate mobile format (10 digits)
        if (!/^\d{10}$/.test(mobile)) {
            return NextResponse.json(
                { error: 'Invalid mobile number format' },
                { status: 400 }
            );
        }

        // Check if mobile already exists
        const existingUser = await prisma.user.findUnique({
            where: { mobile },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Mobile number already registered' },
                { status: 400 }
            );
        }

        // Validate invite code
        const invite = await prisma.inviteCode.findUnique({
            where: { code: inviteCode },
        });

        if (!invite) {
            return NextResponse.json(
                { error: 'Invalid invite code' },
                { status: 400 }
            );
        }

        if (invite.used) {
            return NextResponse.json(
                { error: 'Invite code has already been used' },
                { status: 400 }
            );
        }

        if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
            return NextResponse.json(
                { error: 'Invite code has expired' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                mobile,
                passwordHash,
                role: invite.role,
                state: state || null,
                district: district || null,
                constituency: constituency || null,
                usedInviteId: invite.id,
            },
        });

        // Mark invite as used
        await prisma.inviteCode.update({
            where: { id: invite.id },
            data: { used: true },
        });

        // If the role is LEADER, create a leader profile
        if (invite.role === 'LEADER') {
            // Generate slug from name (lowercase, replace spaces with hyphens, remove special chars)
            const baseSlug = name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            // Ensure uniqueness by checking existing slugs and appending number if needed
            let slug = baseSlug;
            let counter = 1;
            while (await prisma.leaderProfile.findUnique({ where: { slug } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            await prisma.leaderProfile.create({
                data: {
                    userId: user.id,
                    slug,
                    designation: 'Party Leader',
                    constituency: constituency || null,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user.id,
                name: user.name,
                mobile: user.mobile,
                role: user.role,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: 'Failed to register user' },
            { status: 500 }
        );
    }
}
