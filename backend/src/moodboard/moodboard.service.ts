import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoodboardPeg, MoodboardCategory } from './moodboard.entity';

@Injectable()
export class MoodboardService {
  constructor(@InjectRepository(MoodboardPeg) private repo: Repository<MoodboardPeg>) {}

  findByEvent(eventId: string) {
    return this.repo.find({
      where: { eventId },
      order: { category: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MoodboardPeg> {
    const peg = await this.repo.findOneBy({ id });
    if (!peg) throw new NotFoundException('Peg not found');
    return peg;
  }

  async create(dto: any): Promise<MoodboardPeg> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: any): Promise<MoodboardPeg> {
    const peg = await this.findOne(id);
    Object.assign(peg, dto);
    return this.repo.save(peg);
  }

  async approve(id: string, approvedById: string): Promise<MoodboardPeg> {
    const peg = await this.findOne(id);
    peg.isApproved = true;
    peg.approvedById = approvedById;
    peg.approvedAt = new Date();
    return this.repo.save(peg);
  }

  async remove(id: string): Promise<void> {
    const peg = await this.findOne(id);
    await this.repo.remove(peg);
  }
}
