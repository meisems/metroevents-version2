import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { Event } from '../events/event.entity';
import { Quote, QuoteLineItem } from '../quotes/quote.entity';
import { Payment } from '../payments/payment.entity';
import { MoodboardPeg } from '../moodboard/moodboard.entity';
import { AfterEvent } from './after-event.entity';
import { QuotesModule } from '../quotes/quotes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Quote, QuoteLineItem, Payment, MoodboardPeg, AfterEvent]),
    QuotesModule,
  ],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
