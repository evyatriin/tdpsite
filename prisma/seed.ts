import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create initial app settings
    await prisma.appSetting.upsert({
        where: { key: 'auto_approve_posts' },
        update: {},
        create: { key: 'auto_approve_posts', value: 'true' },
    });

    console.log('✅ App settings created');

    // Create States
    const andhraState = await prisma.state.upsert({
        where: { name: 'Andhra Pradesh' },
        update: {},
        create: { name: 'Andhra Pradesh', nameTE: 'ఆంధ్ర ప్రదేశ్' },
    });

    const telanganaState = await prisma.state.upsert({
        where: { name: 'Telangana' },
        update: {},
        create: { name: 'Telangana', nameTE: 'తెలంగాణ' },
    });

    console.log('✅ States created');

    // Andhra Pradesh Districts
    const apDistricts = [
        { name: 'Visakhapatnam', nameTE: 'విశాఖపట్నం' },
        { name: 'Guntur', nameTE: 'గుంటూరు' },
        { name: 'Krishna', nameTE: 'కృష్ణా' },
        { name: 'East Godavari', nameTE: 'తూర్పు గోదావరి' },
        { name: 'Chittoor', nameTE: 'చిత్తూరు' },
    ];

    const createdDistricts: Record<string, string> = {};

    for (const districtData of apDistricts) {
        const district = await prisma.district.upsert({
            where: {
                stateId_name: { stateId: andhraState.id, name: districtData.name }
            },
            update: {},
            create: {
                name: districtData.name,
                nameTE: districtData.nameTE,
                stateId: andhraState.id,
            },
        });
        createdDistricts[districtData.name] = district.id;

        // Add constituencies for each district
        const constituencies = [
            `${districtData.name} Central`,
            `${districtData.name} North`,
            `${districtData.name} South`,
        ];

        for (const consName of constituencies) {
            await prisma.constituency.upsert({
                where: {
                    districtId_name: { districtId: district.id, name: consName }
                },
                update: {},
                create: {
                    name: consName,
                    districtId: district.id,
                },
            });
        }
    }

    console.log('✅ Andhra Pradesh districts and constituencies created');

    // Telangana Districts (sample)
    const telanganaDistricts = [
        { name: 'Hyderabad', nameTE: 'హైదరాబాద్' },
        { name: 'Rangareddy', nameTE: 'రంగారెడ్డి' },
        { name: 'Warangal', nameTE: 'వరంగల్' },
    ];

    for (const districtData of telanganaDistricts) {
        const district = await prisma.district.upsert({
            where: {
                stateId_name: { stateId: telanganaState.id, name: districtData.name }
            },
            update: {},
            create: {
                name: districtData.name,
                nameTE: districtData.nameTE,
                stateId: telanganaState.id,
            },
        });

        const constituencies = [`${districtData.name} Urban`, `${districtData.name} Rural`];
        for (const consName of constituencies) {
            await prisma.constituency.upsert({
                where: {
                    districtId_name: { districtId: district.id, name: consName }
                },
                update: {},
                create: {
                    name: consName,
                    districtId: district.id,
                },
            });
        }
    }

    console.log('✅ Telangana districts and constituencies created');

    // ============================================
    // Create Demo Users with Credentials
    // ============================================
    const passwordHash = await bcrypt.hash('demo123', 12);

    // Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { mobile: '9999900000' },
        update: {},
        create: {
            name: 'Super Admin',
            mobile: '9999900000',
            passwordHash,
            role: 'SUPER_ADMIN',
            state: 'Andhra Pradesh',
            isActive: true,
            canPost: true,
        },
    });
    console.log('✅ Super Admin created: 9999900000 / demo123');

    // Admin
    const admin = await prisma.user.upsert({
        where: { mobile: '9999900001' },
        update: {},
        create: {
            name: 'Demo Admin',
            mobile: '9999900001',
            passwordHash,
            role: 'ADMIN',
            state: 'Andhra Pradesh',
            district: 'Visakhapatnam',
            isActive: true,
            canPost: true,
        },
    });
    console.log('✅ Admin created: 9999900001 / demo123');

    // Leader
    const leader = await prisma.user.upsert({
        where: { mobile: '9999900002' },
        update: {},
        create: {
            name: 'Demo Leader',
            mobile: '9999900002',
            passwordHash,
            role: 'LEADER',
            state: 'Andhra Pradesh',
            district: 'Guntur',
            constituency: 'Guntur Central',
            isActive: true,
            canPost: true,
        },
    });

    // Create leader profile
    await prisma.leaderProfile.upsert({
        where: { userId: leader.id },
        update: {},
        create: {
            userId: leader.id,
            designation: 'MLA',
            constituency: 'Guntur Central',
            bio: 'Dedicated to serving the people of Guntur with TDP values.',
            photoUrl: null,
            socialLinks: {
                youtube: 'https://youtube.com/@TDP',
                twitter: 'https://twitter.com/JaiTDP',
            },
            isVerified: true,
        },
    });
    console.log('✅ Leader created: 9999900002 / demo123');

    // Cadres
    const cadre1 = await prisma.user.upsert({
        where: { mobile: '9999900003' },
        update: {},
        create: {
            name: 'Demo Cadre 1',
            mobile: '9999900003',
            passwordHash,
            role: 'CADRE',
            state: 'Andhra Pradesh',
            district: 'Visakhapatnam',
            constituency: 'Visakhapatnam Central',
            isActive: true,
            canPost: true,
        },
    });

    const cadre2 = await prisma.user.upsert({
        where: { mobile: '9999900004' },
        update: {},
        create: {
            name: 'Demo Cadre 2',
            mobile: '9999900004',
            passwordHash,
            role: 'CADRE',
            state: 'Andhra Pradesh',
            district: 'Krishna',
            constituency: 'Krishna Central',
            isActive: true,
            canPost: true,
        },
    });
    console.log('✅ Cadres created: 9999900003, 9999900004 / demo123');

    // ============================================
    // Create Sample Invite Codes
    // ============================================
    const inviteCodes = [
        { code: 'CADRE2024', role: 'CADRE' as const },
        { code: 'LEADER2024', role: 'LEADER' as const },
        { code: 'ADMIN2024', role: 'ADMIN' as const },
    ];

    for (const invite of inviteCodes) {
        await prisma.inviteCode.upsert({
            where: { code: invite.code },
            update: {},
            create: {
                code: invite.code,
                role: invite.role,
                createdById: superAdmin.id,
            },
        });
    }
    console.log('✅ Invite codes created: CADRE2024, LEADER2024, ADMIN2024');

    // ============================================
    // Create Sample Events
    // ============================================
    const sampleEvents = [
        {
            title: 'Community Health Camp in Visakhapatnam',
            category: 'WELFARE' as const,
            description: 'Free health checkup camp organized for the residents of Visakhapatnam Central constituency. Over 500 people benefited from this initiative.',
            state: 'Andhra Pradesh',
            district: 'Visakhapatnam',
            constituency: 'Visakhapatnam Central',
            userId: cadre1.id,
        },
        {
            title: 'Youth Awareness Program',
            category: 'OUTREACH' as const,
            description: 'Conducted youth awareness program about employment opportunities and skill development in the region.',
            state: 'Andhra Pradesh',
            district: 'Visakhapatnam',
            constituency: 'Visakhapatnam North',
            userId: cadre1.id,
        },
        {
            title: 'Party Meeting in Krishna District',
            category: 'MEETING' as const,
            description: 'Monthly coordination meeting with local party workers to discuss upcoming initiatives and feedback from the community.',
            state: 'Andhra Pradesh',
            district: 'Krishna',
            constituency: 'Krishna Central',
            userId: cadre2.id,
        },
        {
            title: 'Tree Plantation Drive',
            category: 'SOCIAL_SERVICE' as const,
            description: 'Organized a tree plantation drive with volunteers planting over 200 saplings in the local area.',
            state: 'Andhra Pradesh',
            district: 'Krishna',
            constituency: 'Krishna South',
            userId: cadre2.id,
        },
        {
            title: 'Blood Donation Camp',
            category: 'WELFARE' as const,
            description: 'Successful blood donation camp organized in collaboration with local hospitals. 150+ units of blood collected.',
            state: 'Andhra Pradesh',
            district: 'Guntur',
            constituency: 'Guntur Central',
            userId: cadre1.id,
        },
    ];

    for (const eventData of sampleEvents) {
        await prisma.event.create({
            data: {
                ...eventData,
                status: 'APPROVED',
                language: 'en',
            },
        });
    }
    console.log('✅ Sample events created');

    // ============================================
    // Create Sample Media Bytes
    // ============================================
    const sampleMediaBytes = [
        {
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            message: 'Message to the people of Andhra Pradesh about our vision for development.',
            userId: leader.id,
        },
    ];

    for (const mbData of sampleMediaBytes) {
        await prisma.mediaByte.create({
            data: {
                ...mbData,
                videoType: 'youtube',
                language: 'en',
            },
        });
    }
    console.log('✅ Sample media bytes created');

    console.log('\n🎉 Database seeding completed!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('                    DEMO CREDENTIALS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('  SUPER ADMIN:  9999900000 / demo123');
    console.log('  ADMIN:        9999900001 / demo123');
    console.log('  LEADER:       9999900002 / demo123');
    console.log('  CADRE 1:      9999900003 / demo123');
    console.log('  CADRE 2:      9999900004 / demo123');
    console.log('');
    console.log('  INVITE CODES: CADRE2024, LEADER2024, ADMIN2024');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
