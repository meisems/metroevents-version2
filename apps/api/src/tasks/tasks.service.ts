// apps/api/src/tasks/tasks.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findByEvent(eventId: string) {
    return this.prisma.task.findMany({
      where: { eventId },
      include: {
        assignedUser: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async create(data: any) {
    return this.prisma.task.create({
      data,
      include: { assignedUser: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.task.update({ where: { id }, data });
  }

  async complete(id: string, doneById: string) {
    return this.prisma.task.update({
      where: { id },
      data: { isDone: true, doneAt: new Date(), doneById },
    });
  }

  async uncomplete(id: string) {
    return this.prisma.task.update({
      where: { id },
      data: { isDone: false, doneAt: null, doneById: null },
    });
  }

  async remove(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}
