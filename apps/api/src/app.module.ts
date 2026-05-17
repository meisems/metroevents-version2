// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { EventsModule } from './events/events.module';
import { QuotesModule } from './quotes/quotes.module';
import { PaymentsModule } from './payments/payments.module';
import { TasksModule } from './tasks/tasks.module';
import { ChecklistModule } from './checklist/checklist.module';
import { MoodboardModule } from './moodboard/moodboard.module';
import { InventoryModule } from './inventory/inventory.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { EventLogsModule } from './event-logs/event-logs.module';
import { AfterEventsModule } from './after-events/after-events.module';
import { FilesModule } from './files/files.module';
import { MeetingsModule } from './meetings/meetings.module';
import { RemindersModule } from './reminders/reminders.module';
import { ReportsModule } from './reports/reports.module';
import { StorageModule } from './storage/storage.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    EventsModule,
    QuotesModule,
    PaymentsModule,
    TasksModule,
    ChecklistModule,
    MoodboardModule,
    InventoryModule,
    SuppliersModule,
    EventLogsModule,
    AfterEventsModule,
    FilesModule,
    MeetingsModule,
    RemindersModule,
    ReportsModule,
    AdminModule,
    ReviewsModule,
  ],
})
export class AppModule {}
