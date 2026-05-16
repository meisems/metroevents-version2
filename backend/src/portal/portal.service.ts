import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/event.entity';
import { Quote } from '../quotes/quote.entity';
import { Payment } from '../payments/payment.entity';
import { MoodboardPeg } from '../moodboard/moodboard.entity';
import { AfterEvent } from './after-event.entity';

@Injectable()
export class PortalService {
  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(Quote) private quotesRepo: Repository<Quote>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(MoodboardPeg) private moodboardRepo: Repository<MoodboardPeg>,
    @InjectRepository(AfterEvent) private afterEventRepo: Repository<AfterEvent>,
  ) {}

  /** Get all events linked to this client */
  async getMyEvents(clientId: string): Promise<Event[]> {
    return this.eventsRepo.find({ where: { clientId }, order: { eventDate: 'ASC' } });
  }

  /** Get active quote for an event — validates client ownership */
  async getMyQuote(eventId: string, clientId: string): Promise<Quote | null> {
    const event = await this.eventsRepo.findOneBy({ id: eventId });
    if (!event || event.clientId !== clientId)
      throw new ForbiddenException('Access denied');
    return this.quotesRepo.findOne({
      where: { eventId, isActive: true },
      relations: ['lineItems'],
    });
  }

  async getMyPayments(eventId: string, clientId: string): Promise<Payment[]> {
    const event = await this.eventsRepo.findOneBy({ id: eventId });
    if (!event || event.clientId !== clientId)
      throw new ForbiddenException('Access denied');
    return this.paymentsRepo.find({ where: { eventId }, order: { createdAt: 'DESC' } });
  }

  async getMyMoodboard(eventId: string, clientId: string): Promise<MoodboardPeg[]> {
    const event = await this.eventsRepo.findOneBy({ id: eventId });
    if (!event || event.clientId !== clientId)
      throw new ForbiddenException('Access denied');
    return this.moodboardRepo.find({
      where: { eventId },
      order: { category: 'ASC', createdAt: 'ASC' },
    });
  }

  async submitFeedback(eventId: string, clientId: string, dto: Partial<AfterEvent>): Promise<AfterEvent> {
    const event = await this.eventsRepo.findOneBy({ id: eventId });
    if (!event || event.clientId !== clientId)
      throw new ForbiddenException('Access denied');

    const existing = await this.afterEventRepo.findOneBy({ eventId });
    if (existing) {
      Object.assign(existing, dto);
      return this.afterEventRepo.save(existing);
    }
    return this.afterEventRepo.save(
      this.afterEventRepo.create({ ...dto, eventId }),
    );
  }
}
