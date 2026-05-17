// apps/api/src/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findByEvent(eventId: string) {
    return this.prisma.payment.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.payment.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.payment.update({ where: { id }, data });
  }

  async markPaid(id: string, method?: string, referenceNumber?: string) {
    return this.prisma.payment.update({
      where: { id },
      data: { status: 'paid', paidDate: new Date(), method, referenceNumber },
    });
  }

  async remove(id: string) {
    return this.prisma.payment.delete({ where: { id } });
  }

  async getOverdue() {
    return this.prisma.payment.findMany({
      where: {
        status: 'pending',
        dueDate: { lt: new Date() },
      },
      include: {
        event: { include: { client: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
