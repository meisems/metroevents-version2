// apps/api/src/events/events.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';

export class CreateEventDto {
  @IsString() name: string;
  @IsString() eventType: string;
  @IsString() clientId: string;
  @IsOptional() @IsString() venueName?: string;
  @IsOptional() @IsString() venueAddress?: string;
  @IsDateString() eventDate: string;
  @IsOptional() @IsDateString() eventTimeStart?: string;
  @IsOptional() @IsDateString() eventTimeEnd?: string;
  @IsOptional() @IsDateString() callTime?: string;
  @IsOptional() @IsDateString() setupDeadline?: string;
  @IsOptional() @IsString() coordinatorId?: string;
  @IsOptional() @IsString() packageName?: string;
  @IsOptional() @IsNumber() totalBudget?: number;
  @IsOptional() @IsString() colorPalette?: string;
  @IsOptional() @IsString() teamNotes?: string;
  @IsOptional() @IsString() internalNotes?: string;
}

export class UpdateEventDto extends CreateEventDto {}

export class EventQueryDto {
  status?: string;
  type?: string;
  q?: string;
  clientId?: string;
}

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: EventQueryDto, userRole?: string, userId?: string) {
    return this.prisma.event.findMany({
      where: {
        ...(query.status && { status: query.status as any }),
        ...(query.type && { eventType: query.type as any }),
        ...(query.q && { name: { contains: query.q, mode: 'insensitive' } }),
        ...(query.clientId && { clientId: query.clientId }),
      },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        coordinator: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { tasks: true, payments: true, files: true } },
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        client: true,
        coordinator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        quotes: { include: { items: true }, orderBy: { version: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
        tasks: {
          include: {
            assignedUser: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
        checklistItems: { orderBy: [{ phase: 'asc' }, { sortOrder: 'asc' }] },
        moodboardPegs: { orderBy: { sortOrder: 'asc' } },
        reservations: { include: { inventoryItem: true } },
        eventLogs: {
          include: { logger: { select: { id: true, name: true } } },
          orderBy: { loggedAt: 'desc' },
        },
        purchaseOrders: { include: { supplier: true } },
        files: { orderBy: { createdAt: 'desc' } },
        afterEvent: true,
        meetings: true,
      },
    });

    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(dto: CreateEventDto) {
    const eventId = await this.generateEventId();
    return this.prisma.event.create({
      data: {
        eventId,
        name: dto.name,
        eventType: dto.eventType as any,
        clientId: dto.clientId,
        venueName: dto.venueName,
        venueAddress: dto.venueAddress,
        eventDate: new Date(dto.eventDate),
        eventTimeStart: dto.eventTimeStart ? new Date(dto.eventTimeStart) : undefined,
        eventTimeEnd: dto.eventTimeEnd ? new Date(dto.eventTimeEnd) : undefined,
        callTime: dto.callTime ? new Date(dto.callTime) : undefined,
        setupDeadline: dto.setupDeadline ? new Date(dto.setupDeadline) : undefined,
        coordinatorId: dto.coordinatorId,
        packageName: dto.packageName,
        totalBudget: dto.totalBudget ?? 0,
        colorPalette: dto.colorPalette,
        teamNotes: dto.teamNotes,
        internalNotes: dto.internalNotes,
      },
      include: { client: true },
    });
  }

  async update(id: string, dto: Partial<UpdateEventDto>) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        eventTimeStart: dto.eventTimeStart ? new Date(dto.eventTimeStart) : undefined,
        eventTimeEnd: dto.eventTimeEnd ? new Date(dto.eventTimeEnd) : undefined,
        callTime: dto.callTime ? new Date(dto.callTime) : undefined,
        setupDeadline: dto.setupDeadline ? new Date(dto.setupDeadline) : undefined,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.event.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }

  async getFinancialSummary(eventId: string) {
    const [quote, payments] = await Promise.all([
      this.prisma.quote.findFirst({
        where: { eventId, isActive: true },
        orderBy: { version: 'desc' },
      }),
      this.prisma.payment.aggregate({
        where: { eventId, status: 'paid' },
        _sum: { amount: true },
      }),
    ]);

    const totalPaid = Number(payments._sum.amount ?? 0);
    const grandTotal = Number(quote?.grandTotal ?? 0);

    return {
      grandTotal,
      totalPaid,
      balanceDue: grandTotal - totalPaid,
      quote,
    };
  }

  private async generateEventId(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id: string;
    do {
      const code = Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)],
      ).join('');
      id = `EVT-${code}`;
    } while (await this.prisma.event.findUnique({ where: { eventId: id } }));
    return id;
  }
}
