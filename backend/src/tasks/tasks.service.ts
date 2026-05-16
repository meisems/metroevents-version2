import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  findByEvent(eventId: string) {
    return this.repo.find({ where: { eventId }, order: { priority: 'DESC', dueDate: 'ASC' } });
  }

  async findOne(id: string): Promise<Task> {
    const t = await this.repo.findOneBy({ id });
    if (!t) throw new NotFoundException('Task not found');
    return t;
  }

  async create(dto: any): Promise<Task> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: any): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, dto);
    return this.repo.save(task);
  }

  async complete(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id);
    task.status = TaskStatus.DONE;
    task.completedAt = new Date();
    task.completedById = userId;
    return this.repo.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.repo.remove(task);
  }
}
