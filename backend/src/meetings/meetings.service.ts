import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting, MeetingStatus } from './meeting.entity';

@Injectable()
export class MeetingsService {
  constructor(@InjectRepository(Meeting) private repo: Repository<Meeting>) {}

  async findAll(status?: MeetingStatus, search?: string) {
    const qb = this.repo.createQueryBuilder('m').orderBy('m.meetingDate', 'DESC');
    if (status) qb.andWhere('m.status = :status', { status });
    if (search) qb.andWhere(
      '(m.clientName ILIKE :q OR m.location ILIKE :q OR m.packageDiscussed ILIKE :q)',
      { q: `%${search}%` },
    );
    return qb.getMany();
  }

  async findOne(id: string): Promise<Meeting> {
    const m = await this.repo.findOneBy({ id });
    if (!m) throw new NotFoundException('Meeting not found');
    return m;
  }

  async create(dto: any): Promise<Meeting> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: any): Promise<Meeting> {
    const m = await this.findOne(id);
    Object.assign(m, dto);
    return this.repo.save(m);
  }

  async updateStatus(id: string, status: MeetingStatus): Promise<Meeting> {
    const m = await this.findOne(id);
    m.status = status;
    return this.repo.save(m);
  }

  async remove(id: string): Promise<void> {
    const m = await this.findOne(id);
    await this.repo.remove(m);
  }

  async getStats() {
    const today = new Date().toISOString().split('T')[0];
    const [total, todayCount, upcomingCount, completedCount] = await Promise.all([
      this.repo.count(),
      this.repo.countBy({ meetingDate: today }),
      this.repo.countBy({ status: MeetingStatus.SCHEDULED }),
      this.repo.countBy({ status: MeetingStatus.COMPLETED }),
    ]);
    return { total, today: todayCount, upcoming: upcomingCount, completed: completedCount };
  }
}
