// apps/api/src/meetings/meetings.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(upcoming?: boolean) {
    return this.prisma.meeting.findMany({
      where: upcoming ? { meetingDate: { gte: new Date() } } : undefined,
      include: {
        event: { select: { id: true, name: true, eventId: true } },
      },
      orderBy: { meetingDate: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.meeting.create({
      data: {
        ...data,
        meetingDate: new Date(data.meetingDate),
        meetingTime: new Date(data.meetingTime),
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.meeting.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.meeting.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    return this.prisma.meeting.delete({ where: { id } });
  }

  async getUpcomingCount() {
    return this.prisma.meeting.count({
      where: { meetingDate: { gte: new Date() }, status: 'scheduled' },
    });
  }
}
