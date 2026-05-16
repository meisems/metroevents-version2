import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventLog } from './event-log.entity';
import { UserRole } from '../users/user.entity';

@Injectable()
export class EventLogService {
  constructor(@InjectRepository(EventLog) private repo: Repository<EventLog>) {}

  findByEvent(eventId: string) {
    return this.repo.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: any, userId: string, userName: string): Promise<EventLog> {
    return this.repo.save(this.repo.create({
      ...dto,
      loggedById: userId,
      loggedByName: userName,
    }));
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const log = await this.repo.findOneBy({ id });
    if (!log) throw new NotFoundException('Log entry not found');
    if (userRole !== UserRole.ADMIN && log.loggedById !== userId) {
      throw new ForbiddenException('Cannot delete another user\'s log entry');
    }
    await this.repo.remove(log);
  }
}
