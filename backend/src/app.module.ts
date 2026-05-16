import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { EventsModule } from './modules/events/events.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { MoodboardModule } from './modules/moodboard/moodboard.module';
import { ChecklistModule } from './modules/checklist/checklist.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { EventLogModule } from './modules/event-log/event-log.module';
import { FilesModule } from './modules/files/files.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PortalModule } from './modules/portal/portal.module';
import { PublicModule } from './modules/public/public.module';
import { StorageModule } from './modules/storage/storage.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get('DATABASE_HOST'),
        port:     +config.get('DATABASE_PORT'),
        database: config.get('DATABASE_NAME'),
        username: config.get('DATABASE_USER'),
        password: config.get('DATABASE_PASSWORD'),
        entities:   [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') === 'development',
        logging:     config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    StorageModule, MailModule, AuthModule, UsersModule, ClientsModule,
    EventsModule, QuotesModule, PaymentsModule, InventoryModule,
    SuppliersModule, MoodboardModule, ChecklistModule, TasksModule,
    MeetingsModule, EventLogModule, FilesModule, RemindersModule,
    ReportsModule, PortalModule, PublicModule,
  ],
})
export class AppModule {}
