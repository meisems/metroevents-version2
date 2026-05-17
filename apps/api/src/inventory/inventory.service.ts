// apps/api/src/inventory/inventory.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(q?: string, category?: string) {
    return this.prisma.inventoryItem.findMany({
      where: {
        isActive: true,
        ...(q && { name: { contains: q, mode: 'insensitive' } }),
        ...(category && { category }),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.inventoryItem.findUniqueOrThrow({
      where: { id },
      include: {
        reservations: {
          include: { event: { select: { id: true, name: true, eventDate: true } } },
          where: { status: { in: ['reserved', 'checked_out'] } },
          orderBy: { reservedFrom: 'asc' },
        },
      },
    });
  }

  async create(data: any) {
    return this.prisma.inventoryItem.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.inventoryItem.update({ where: { id }, data });
  }

  async getAvailability(itemId: string, from: Date, until: Date) {
    const item = await this.prisma.inventoryItem.findUniqueOrThrow({ where: { id: itemId } });
    const reserved = await this.prisma.reservation.aggregate({
      where: {
        inventoryItemId: itemId,
        status: { in: ['reserved', 'checked_out'] },
        reservedFrom: { lte: until },
        reservedUntil: { gte: from },
      },
      _sum: { quantity: true },
    });
    const reservedQty = Number(reserved._sum.quantity ?? 0);
    return {
      item,
      available: item.availableQty - reservedQty,
      reservedInRange: reservedQty,
    };
  }

  async createReservation(data: any) {
    const avail = await this.getAvailability(
      data.inventoryItemId,
      new Date(data.reservedFrom),
      new Date(data.reservedUntil),
    );
    if (avail.available < data.quantity) {
      throw new BadRequestException(
        `Only ${avail.available} units available in this period`,
      );
    }
    return this.prisma.reservation.create({ data });
  }

  async updateReservation(id: string, data: any) {
    return this.prisma.reservation.update({ where: { id }, data });
  }

  async checkOut(reservationId: string) {
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'checked_out', checkedOutAt: new Date() },
    });
  }

  async returnItem(reservationId: string) {
    return this.prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'returned', returnedAt: new Date() },
    });
  }

  async getCategories() {
    const items = await this.prisma.inventoryItem.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return items.map((i) => i.category);
  }

  async getLowStock(threshold = 5) {
    return this.prisma.inventoryItem.findMany({
      where: { availableQty: { lte: threshold }, isActive: true },
      orderBy: { availableQty: 'asc' },
    });
  }
}
