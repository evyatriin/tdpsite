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

    // Andhra Pradesh Districts (13 districts)
    const apDistricts = [
        { name: 'Anantapur', nameTE: 'అనంతపురం' },
        { name: 'Chittoor', nameTE: 'చిత్తూరు' },
        { name: 'East Godavari', nameTE: 'తూర్పు గోదావరి' },
        { name: 'Guntur', nameTE: 'గుంటూరు' },
        { name: 'Krishna', nameTE: 'కృష్ణా' },
        { name: 'Kurnool', nameTE: 'కర్నూలు' },
        { name: 'Nellore', nameTE: 'నెల్లూరు' },
        { name: 'Prakasam', nameTE: 'ప్రకాశం' },
        { name: 'Srikakulam', nameTE: 'శ్రీకాకుళం' },
        { name: 'Visakhapatnam', nameTE: 'విశాఖపట్నం' },
        { name: 'Vizianagaram', nameTE: 'విజయనగరం' },
        { name: 'West Godavari', nameTE: 'పశ్చిమ గోదావరి' },
        { name: 'YSR Kadapa', nameTE: 'వైఎస్ఆర్ కడప' },
    ];

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

        // Add some sample constituencies
        const sampleConstituencies = [
            `${districtData.name} (Urban)`,
            `${districtData.name} (Rural)`,
            `${districtData.name} Central`,
        ];

        for (const consName of sampleConstituencies) {
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

    // Telangana Districts (33 districts)
    const telanganaDistricts = [
        { name: 'Adilabad', nameTE: 'ఆదిలాబాద్' },
        { name: 'Bhadradri Kothagudem', nameTE: 'భద్రాద్రి కొత్తగూడెం' },
        { name: 'Hyderabad', nameTE: 'హైదరాబాద్' },
        { name: 'Jagtial', nameTE: 'జగిత్యాల' },
        { name: 'Jangaon', nameTE: 'జనగాం' },
        { name: 'Jayashankar Bhupalpally', nameTE: 'జయశంకర్ భూపాలపల్లి' },
        { name: 'Jogulamba Gadwal', nameTE: 'జోగులాంబ గద్వాల' },
        { name: 'Kamareddy', nameTE: 'కామారెడ్డి' },
        { name: 'Karimnagar', nameTE: 'కరీంనగర్' },
        { name: 'Khammam', nameTE: 'ఖమ్మం' },
        { name: 'Komaram Bheem Asifabad', nameTE: 'కొమరం భీం ఆసిఫాబాద్' },
        { name: 'Mahabubnagar', nameTE: 'మహబూబ్ నగర్' },
        { name: 'Mancherial', nameTE: 'మంచిర్యాల' },
        { name: 'Medak', nameTE: 'మెదక్' },
        { name: 'Medchal-Malkajgiri', nameTE: 'మేడ్చల్-మల్కాజిగిరి' },
        { name: 'Mulugu', nameTE: 'ములుగు' },
        { name: 'Nagarkurnool', nameTE: 'నాగర్‌కర్నూల్' },
        { name: 'Nalgonda', nameTE: 'నల్గొండ' },
        { name: 'Narayanpet', nameTE: 'నారాయణపేట' },
        { name: 'Nirmal', nameTE: 'నిర్మల్' },
        { name: 'Nizamabad', nameTE: 'నిజామాబాద్' },
        { name: 'Peddapalli', nameTE: 'పెద్దపల్లి' },
        { name: 'Rajanna Sircilla', nameTE: 'రాజన్న సిరిసిల్ల' },
        { name: 'Rangareddy', nameTE: 'రంగారెడ్డి' },
        { name: 'Sangareddy', nameTE: 'సంగారెడ్డి' },
        { name: 'Siddipet', nameTE: 'సిద్దిపేట' },
        { name: 'Suryapet', nameTE: 'సూర్యాపేట' },
        { name: 'Vikarabad', nameTE: 'వికారాబాద్' },
        { name: 'Wanaparthy', nameTE: 'వనపర్తి' },
        { name: 'Warangal Rural', nameTE: 'వరంగల్ రూరల్' },
        { name: 'Warangal Urban', nameTE: 'వరంగల్ అర్బన్' },
        { name: 'Yadadri Bhuvanagiri', nameTE: 'యాదాద్రి భువనగిరి' },
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

        // Add some sample constituencies
        const sampleConstituencies = [
            `${districtData.name} (Urban)`,
            `${districtData.name} (Rural)`,
        ];

        for (const consName of sampleConstituencies) {
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

    // Create Super Admin user
    const passwordHash = await bcrypt.hash('admin123', 12);

    const superAdmin = await prisma.user.upsert({
        where: { mobile: '9999999999' },
        update: {},
        create: {
            name: 'Super Admin',
            mobile: '9999999999',
            passwordHash,
            role: 'SUPER_ADMIN',
            state: 'Andhra Pradesh',
            isActive: true,
            canPost: true,
        },
    });

    console.log('✅ Super Admin created (mobile: 9999999999, password: admin123)');

    // Create sample invite codes
    await prisma.inviteCode.upsert({
        where: { code: 'CADRE001' },
        update: {},
        create: {
            code: 'CADRE001',
            role: 'CADRE',
            createdById: superAdmin.id,
        },
    });

    await prisma.inviteCode.upsert({
        where: { code: 'LEADER01' },
        update: {},
        create: {
            code: 'LEADER01',
            role: 'LEADER',
            createdById: superAdmin.id,
        },
    });

    await prisma.inviteCode.upsert({
        where: { code: 'ADMIN001' },
        update: {},
        create: {
            code: 'ADMIN001',
            role: 'ADMIN',
            createdById: superAdmin.id,
        },
    });

    console.log('✅ Sample invite codes created: CADRE001, LEADER01, ADMIN001');

    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
