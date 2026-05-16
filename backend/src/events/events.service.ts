import {
  Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus, EventType } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(@InjectRepository(Event) private repo: Repository<Event>) {}

  async findAll(clientId?: string, status?: EventStatus, type?: EventType) {
    const qb = this.repo.createQueryBuilder('e')
      .leftJoinAndSelect('e.client', 'client')
      .orderBy('e.eventDate', 'ASC');

    if (clientId) qb.andWhere('e.clientId = :clientId', { clientId });
    if (status)   qb.andWhere('e.status = :status', { status });
    if (type)     qb.andWhere('e.type = :type', { type });

    return qb.getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.repo.findOne({
      where: { id },
      relations: ['client'],
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(dto: CreateEventDto): Promise<Event> {
    const event = this.repo.create(dto);
    return this.repo.save(event);
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, dto);
    return this.repo.save(event);
  }

  async advanceStatus(id: string): Promise<Event> {
    const ORDER: EventStatus[] = [
      EventStatus.PLANNING, EventStatus.PRODUCTION, EventStatus.READY,
      EventStatus.EVENT_DAY, EventStatus.DONE,
    ];
    const event = await this.findOne(id);
    const idx = ORDER.indexOf(event.status);
    if (idx === -1 || idx === ORDER.length - 1)
      throw new ForbiddenException('Cannot advance status further');
    event.status = ORDER[idx + 1];
    return this.repo.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.repo.remove(event);
  }

  /** Upcoming events in the next N days */
  async upcoming(days = 7): Promise<Event[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    return this.repo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.client', 'client')
      .where('e.eventDate >= :now', { now: now.toISOString().split('T')[0] })
      .andWhere('e.eventDate <= :future', { future: future.toISOString().split('T')[0] })
      .andWhere('e.status NOT IN (:...done)', { done: [EventStatus.DONE, EventStatus.CANCELLED] })
      .orderBy('e.eventDate', 'ASC')
      .getMany();
  }
}
