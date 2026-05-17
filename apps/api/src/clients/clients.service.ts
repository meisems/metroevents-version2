// apps/api/src/clients/clients.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PIPELINE_ORDER = [
  'new_inquiry',
  'ocular_scheduled',
  'proposal_sent',
  'reserved',
  'fully_booked',
  'done',
];

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(q?: string, stage?: string) {
    return this.prisma.client.findMany({
      where: {
        ...(q && { fullName: { contains: q, mode: 'insensitive' } }),
        ...(stage && { pipelineStage: stage as any }),
      },
      include: {
        _count: { select: { events: true } },
        events: {
          orderBy: { eventDate: 'desc' },
          take: 1,
          select: { id: true, name: true, eventDate: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        events: {
          include: { coordinator: { select: { id: true, name: true } } },
          orderBy: { eventDate: 'desc' },
        },
        clientAccount: true,
        reviews: true,
      },
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async create(data: any) {
    return this.prisma.client.create({ data });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.client.update({ where: { id }, data });
  }

  async advanceStage(id: string) {
    const client = await this.prisma.client.findUniqueOrThrow({ where: { id } });
    const idx = PIPELINE_ORDER.indexOf(client.pipelineStage);
    if (idx === -1 || idx >= PIPELINE_ORDER.length - 1) return client;

    return this.prisma.client.update({
      where: { id },
      data: {
        pipelineStage: PIPELINE_ORDER[idx + 1] as any,
        lastContacted: new Date(),
      },
    });
  }

  async setStage(id: string, stage: string) {
    return this.prisma.client.update({
      where: { id },
      data: { pipelineStage: stage as any, lastContacted: new Date() },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }

  async getPipelineCounts() {
    const counts = await this.prisma.client.groupBy({
      by: ['pipelineStage'],
      _count: true,
    });
    return Object.fromEntries(counts.map((c) => [c.pipelineStage, c._count]));
  }
}
