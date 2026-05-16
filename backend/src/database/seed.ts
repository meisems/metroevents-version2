
/**
 * Metro Events v2 — Database Seeder
 *
 * Run with:  npm run seed
 * Script:    ts-node src/database/seed.ts
 *
 * What it creates:
 *  - 1 default admin user
 *  - 3 sample clients across different CRM stages
 *  - 2 sample events
 *  - 4 approved public reviews (visible on landing page)
 *  - 2 sample order requests
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

// ── Entity imports ─────────────────────────────────────────────────────────
import { User, UserRole, AccountStatus } from '../modules/users/user.entity';
import { Client, CRMStage } from '../modules/clients/client.entity';
import { Event, EventStatus, EventType } from '../modules/events/event.entity';
import { Review, ReviewStatus } from '../modules/public/review.entity';
import { OrderRequest, OrderRequestStatus, PackagePreference } from '../modules/public/order-request.entity';

// ── DataSource ─────────────────────────────────────────────────────────────
const AppDataSource = new DataSource({
  type: 'postgres',
  host:     process.env.DATABASE_HOST     ?? 'localhost',
  port:     +(process.env.DATABASE_PORT   ?? 5432),
  database: process.env.DATABASE_NAME     ?? 'metroevents',
  username: process.env.DATABASE_USER     ?? 'metrouser',
  password: process.env.DATABASE_PASSWORD ?? 'metropass',
  entities: [User, Client, Event, Review, OrderRequest],
  synchronize: true,
  logging: false,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('📦 Connected to database. Seeding...\n');

  const userRepo    = AppDataSource.getRepository(User);
  const clientRepo  = AppDataSource.getRepository(Client);
  const eventRepo   = AppDataSource.getRepository(Event);
  const reviewRepo  = AppDataSource.getRepository(Review);
  const orderRepo   = AppDataSource.getRepository(OrderRequest);

  // ── 1. ADMIN USER ──────────────────────────────────────────────────────────
  const existingAdmin = await userRepo.findOneBy({ email: 'admin@metroevents.ph' });
  if (!existingAdmin) {
    const admin = userRepo.create({
      firstName: 'Metro',
      lastName:  'Admin',
      email:     'admin@metroevents.ph',
      password:  await bcrypt.hash('admin1234', 12),
      role:      UserRole.ADMIN,
      status:    AccountStatus.ACTIVE,
      emailVerified: true,
    });
    await userRepo.save(admin);
    console.log('✅ Admin user created: admin@metroevents.ph / admin1234');
  } else {
    console.log('⚠️  Admin already exists — skipping.');
  }

  // Seed a coordinator account
  const existingCoord = await userRepo.findOneBy({ email: 'coordinator@metroevents.ph' });
  if (!existingCoord) {
    const coord = userRepo.create({
      firstName: 'Jessa',
      lastName:  'Reyes',
      email:     'coordinator@metroevents.ph',
      password:  await bcrypt.hash('coord1234', 12),
      role:      UserRole.COORDINATOR,
      status:    AccountStatus.ACTIVE,
      emailVerified: true,
    });
    await userRepo.save(coord);
    console.log('✅ Coordinator user created: coordinator@metroevents.ph / coord1234');
  }

  // ── 2. SAMPLE CLIENTS ──────────────────────────────────────────────────────
  const clientSeeds = [
    {
      fullName: 'Maria & Ramon Cruz',
      email:    'maria.cruz@email.com',
      phone:    '+63 912 111 1111',
      stage:    CRMStage.FULLY_BOOKED,
      referralSource: 'Instagram',
    },
    {
      fullName: 'Lorna Paguia',
      email:    'lorna.paguia@email.com',
      phone:    '+63 912 222 2222',
      stage:    CRMStage.PROPOSAL_SENT,
      referralSource: 'Referral',
    },
    {
      fullName: 'Jerome Villanueva',
      email:    'jv@techstar.com.ph',
      phone:    '+63 917 333 3333',
      stage:    CRMStage.NEW_INQUIRY,
      referralSource: 'Google',
    },
  ];

  const savedClients: Client[] = [];
  for (const seed of clientSeeds) {
    const exists = await clientRepo.findOneBy({ email: seed.email });
    if (!exists) {
      const client = clientRepo.create(seed);
      savedClients.push(await clientRepo.save(client));
      console.log(`✅ Client created: ${seed.fullName}`);
    } else {
      savedClients.push(exists);
    }
  }

  // ── 3. SAMPLE EVENTS ───────────────────────────────────────────────────────
  if (savedClients[0]) {
    const existingEvent = await eventRepo.findOneBy({ clientId: savedClients[0].id });
    if (!existingEvent) {
      await eventRepo.save(
        eventRepo.create({
          title:       'Cruz - Ramon Wedding',
          type:        EventType.WEDDING,
          status:      EventStatus.PRODUCTION,
          eventDate:   '2025-12-20',
          venue:       'Tagaytay Highlands',
          venueAddress:'Tagaytay-Calamba Rd, Tagaytay City',
          guestCount:  250,
          packageName: 'Platinum',
          totalAmount: 95000,
          totalPaid:   50000,
          clientId:    savedClients[0].id,
        }),
      );
      console.log('✅ Sample event created: Cruz - Ramon Wedding');
    }
  }

  // ── 4. APPROVED PUBLIC REVIEWS ─────────────────────────────────────────────
  const reviewSeeds = [
    {
      fullName:          'Maria & Ramon Cruz',
      eventType:         'wedding',
      ratingOverall:     5, ratingDesign: 5, ratingCoordination: 5,
      ratingOnTime:      5, ratingCrew:   5, ratingValue:        5,
      testimonial:       '"Metro Events made our wedding day absolutely perfect. Every single detail was exactly how we imagined — from the fairy-light canopy to the flower wall behind the altar. Our guests are still talking about it!"',
      recommend:         true,
      status:            ReviewStatus.APPROVED,
      featuredOnLanding: true,
      displayOrder:      1,
    },
    {
      fullName:          'Lorna Paguia',
      eventType:         'debut',
      ratingOverall:     5, ratingDesign: 5, ratingCoordination: 5,
      ratingOnTime:      4.5, ratingCrew: 5, ratingValue:        5,
      testimonial:       '"Ang ganda ng debut ni Bea! The team was so professional and responsive. They even sent me updates through the client portal which was super convenient. Sobrang worth it!"',
      recommend:         true,
      status:            ReviewStatus.APPROVED,
      featuredOnLanding: true,
      displayOrder:      2,
    },
    {
      fullName:          'Jerome Villanueva',
      eventType:         'corporate',
      ratingOverall:     5, ratingDesign: 4.5, ratingCoordination: 5,
      ratingOnTime:      5, ratingCrew:   5,   ratingValue:        4.5,
      testimonial:       '"We hired Metro Events for our company\'s 10th anniversary gala. The execution was flawless — 500 guests, seamless flow, and everything on schedule. Highly recommended for corporate events!"',
      recommend:         true,
      status:            ReviewStatus.APPROVED,
      featuredOnLanding: true,
      displayOrder:      3,
    },
    {
      fullName:          'Kristine Tabios',
      eventType:         'birthday',
      ratingOverall:     5, ratingDesign: 5, ratingCoordination: 5,
      ratingOnTime:      5, ratingCrew:   5, ratingValue:        4.5,
      testimonial:       '"The team was on-site hours before the event just to make sure everything was perfect. When a small issue came up with the lighting, they fixed it in minutes — I only found out afterwards!"',
      recommend:         true,
      status:            ReviewStatus.APPROVED,
      featuredOnLanding: false,
      displayOrder:      4,
    },
  ];

  for (const r of reviewSeeds) {
    const exists = await reviewRepo.findOneBy({ fullName: r.fullName });
    if (!exists) {
      await reviewRepo.save(reviewRepo.create({ ...r, approvedAt: new Date() }));
      console.log(`✅ Review created: ${r.fullName}`);
    }
  }

  // ── 5. SAMPLE ORDER REQUESTS ───────────────────────────────────────────────
  const orderSeeds = [
    {
      fullName:          'Anya Dela Cruz',
      email:             'anya@email.com',
      phone:             '+63 912 444 4444',
      eventDate:         '2026-03-15',
      guestCount:        120,
      packagePreference: PackagePreference.GOLD,
      eventType:         'wedding',
      message:           'Looking for a garden wedding setup with fairy lights and lush florals.',
      status:            OrderRequestStatus.NEW,
    },
    {
      fullName:          'Carla Mendoza',
      email:             'carla.m@email.com',
      phone:             '+63 917 555 5555',
      eventDate:         '2026-06-07',
      guestCount:        50,
      packagePreference: PackagePreference.SILVER,
      eventType:         'birthday',
      message:           'My daughter\'s 7th birthday party. Unicorn theme.',
      status:            OrderRequestStatus.CONTACTED,
    },
  ];

  for (const o of orderSeeds) {
    const exists = await orderRepo.findOneBy({ email: o.email });
    if (!exists) {
      await orderRepo.save(orderRepo.create(o));
      console.log(`✅ Order request seeded: ${o.fullName}`);
    }
  }

  await AppDataSource.destroy();
  console.log('\n🎉 Seed complete! You can now log in with admin@metroevents.ph / admin1234');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
</parameter>

Finally, let's write a module integration test and wire everything into the auth strategies that were referenced earlier: