// apps/api/src/suppliers/suppliers.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(q?: string, category?: string) {
    return this.prisma.supplier.findMany({
      where: {
        ...(q && { name: { contains: q, mode: 'insensitive' } }),
        ...(category && { category }),
      },
      include: { _count: { select: { purchaseOrders: true } } },
      orderBy: [{ isPreferred: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.supplier.findUniqueOrThrow({
      where: { id },
      include: {
        purchaseOrders: {
          include: { event: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.supplier.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.supplier.update({ where: { id }, data });
  }

  async createPO(data: any) {
    const count = await this.prisma.purchaseOrder.count();
    const poNumber = `PO-${String(count + 1).padStart(6, '0')}`;
    return this.prisma.purchaseOrder.create({
      data: { ...data, poNumber },
      include: { supplier: true, event: { select: { id: true, name: true } } },
    });
  }

  async updatePO(id: string, data: any) {
    return this.prisma.purchaseOrder.update({ where: { id }, data });
  }

  async getPOsByEvent(eventId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { eventId },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCategories() {
    const items = await this.prisma.supplier.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return items.map((i) => i.category);
  }
}
