// apps/api/src/event-logs/event-logs.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventLogsService {
  constructor(private prisma: PrismaService) {}

  async findByEvent(eventId: string) {
    return this.prisma.eventLog.findMany({
      where: { eventId },
      include: { logger: { select: { id: true, name: true, role: true } } },
      orderBy: { loggedAt: 'desc' },
    });
  }

  async create(data: any, loggedBy: string) {
    return this.prisma.eventLog.create({
      data: { ...data, loggedBy },
      include: { logger: { select: { id: true, name: true } } },
    });
  }

  async approveChangeRequest(id: string, approvedByName: string) {
    return this.prisma.eventLog.update({
      where: { id },
      data: { isApprovedByClient: true, approvedByName },
    });
  }

  async getTimeline(eventId: string) {
    return this.prisma.eventLog.findMany({
      where: { eventId, logType: 'timeline_tick' },
      orderBy: { loggedAt: 'asc' },
    });
  }
}
