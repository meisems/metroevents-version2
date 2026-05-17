// apps/api/src/after-events/after-events.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AfterEventsService {
  constructor(private prisma: PrismaService) {}

  async findByEvent(eventId: string) {
    return this.prisma.afterEvent.findUnique({ where: { eventId } });
  }

  async upsert(eventId: string, data: any) {
    return this.prisma.afterEvent.upsert({
      where: { eventId },
      create: { eventId, ...data },
      update: data,
    });
  }

  async submitClientFeedback(eventId: string, data: any) {
    return this.prisma.afterEvent.upsert({
      where: { eventId },
      create: { eventId, ...data, submittedByClient: true },
      update: { ...data, submittedByClient: true },
    });
  }

  async getAverageRatings() {
    const result = await this.prisma.afterEvent.aggregate({
      where: { ratingOverall: { not: null } },
      _avg: {
        ratingOverall: true,
        ratingDesign: true,
        ratingCoordination: true,
        ratingOnTime: true,
        ratingCrew: true,
        ratingValue: true,
      },
      _count: { ratingOverall: true },
    });
    return result;
  }
}
