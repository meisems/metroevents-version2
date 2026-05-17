// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Metro Events database...');

  // Admin user
  const adminHash = await bcrypt.hash('admin1234', 12);
  await prisma.user.upsert({
    where: { email: 'admin@metroevents.ph' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@metroevents.ph',
      passwordHash: adminHash,
      role: 'admin',
    },
  });
  console.log('✅ Admin seeded: admin@metroevents.ph / admin1234');

  // Coordinator
  const coordHash = await bcrypt.hash('coord1234', 12);
  await prisma.user.upsert({
    where: { email: 'coordinator@metroevents.ph' },
    update: {},
    create: {
      name: 'Main Coordinator',
      email: 'coordinator@metroevents.ph',
      passwordHash: coordHash,
      role: 'coordinator',
    },
  });
  console.log('✅ Coordinator seeded: coordinator@metroevents.ph / coord1234');

  // Designer
  const designHash = await bcrypt.hash('design1234', 12);
  await prisma.user.upsert({
    where: { email: 'designer@metroevents.ph' },
    update: {},
    create: {
      name: 'Lead Designer',
      email: 'designer@metroevents.ph',
      passwordHash: designHash,
      role: 'designer',
    },
  });
  console.log('✅ Designer seeded');

  // Warehouse
  const warehouseHash = await bcrypt.hash('warehouse1234', 12);
  await prisma.user.upsert({
    where: { email: 'warehouse@metroevents.ph' },
    update: {},
    create: {
      name: 'Warehouse Staff',
      email: 'warehouse@metroevents.ph',
      passwordHash: warehouseHash,
      role: 'warehouse',
    },
  });
  console.log('✅ Warehouse seeded');

  // Demo client
  const client = await prisma.client.upsert({
    where: { email: 'demo.client@example.com' },
    update: {},
    create: {
      fullName: 'Maria Santos',
      email: 'demo.client@example.com',
      phone: '+63 917 000 0000',
      pipelineStage: 'reserved',
      referredBy: 'Social Media',
    },
  });
  console.log('✅ Demo client seeded');

  // Demo event
  const existing = await prisma.event.findFirst({ where: { name: 'Santos Wedding' } });
  if (!existing) {
    const coordinator = await prisma.user.findUnique({ where: { email: 'coordinator@metroevents.ph' } });
    await prisma.event.create({
      data: {
        eventId: 'EVT-DEMO01',
        name: 'Santos Wedding',
        eventType: 'wedding',
        status: 'planning',
        clientId: client.id,
        coordinatorId: coordinator!.id,
        eventDate: new Date('2025-12-15'),
        venueName: 'Grand Ballroom, Manila Hotel',
        venueAddress: 'One Rizal Park, Manila',
        colorPalette: 'Dusty rose, ivory, sage green',
        totalBudget: 350000,
      },
    });
    console.log('✅ Demo event seeded: EVT-DEMO01');
  }

  // Demo inventory items
  const inventoryItems = [
    { name: 'Tiffany Chair (White)', category: 'Furniture', totalQty: 200, availableQty: 200, unit: 'pc' },
    { name: 'Round Table (5ft)', category: 'Furniture', totalQty: 20, availableQty: 20, unit: 'pc' },
    { name: 'Rectangular Table (6ft)', category: 'Furniture', totalQty: 15, availableQty: 15, unit: 'pc' },
    { name: 'LED Candelabra (Gold)', category: 'Lighting', totalQty: 30, availableQty: 30, unit: 'pc' },
    { name: 'Fairy Light Curtain', category: 'Lighting', totalQty: 10, availableQty: 10, unit: 'set' },
    { name: 'Flower Wall Panel (3x3ft)', category: 'Backdrop', totalQty: 8, availableQty: 8, unit: 'pc' },
    { name: 'Sequin Tablecloth', category: 'Linen', totalQty: 40, availableQty: 40, unit: 'pc' },
    { name: 'Charger Plates (Gold)', category: 'Tableware', totalQty: 300, availableQty: 300, unit: 'pc' },
  ];

  for (const item of inventoryItems) {
    const exists = await prisma.inventoryItem.findFirst({ where: { name: item.name } });
    if (!exists) {
      await prisma.inventoryItem.create({ data: item });
    }
  }
  console.log('✅ Demo inventory seeded');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
