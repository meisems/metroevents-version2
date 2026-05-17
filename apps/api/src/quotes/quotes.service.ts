// apps/api/src/quotes/quotes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async findByEvent(eventId: string) {
    return this.prisma.quote.findMany({
      where: { eventId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { version: 'desc' },
    });
  }

  async findOne(id: string) {
    const q = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        event: { include: { client: true } },
      },
    });
    if (!q) throw new NotFoundException('Quote not found');
    return q;
  }

  async create(data: any) {
    const lastQuote = await this.prisma.quote.findFirst({
      where: { eventId: data.eventId },
      orderBy: { version: 'desc' },
    });
    const version = (lastQuote?.version ?? 0) + 1;

    await this.prisma.quote.updateMany({
      where: { eventId: data.eventId },
      data: { isActive: false },
    });

    const { items, ...quoteData } = data;
    const quote = await this.prisma.quote.create({
      data: { ...quoteData, version },
    });

    if (items?.length) {
      await this.prisma.quoteItem.createMany({
        data: items.map((item: any, i: number) => ({
          ...item,
          quoteId: quote.id,
          totalPrice: item.quantity * item.unitPrice,
          sortOrder: i,
        })),
      });
    }

    return this.findOne(quote.id);
  }

  async addItem(quoteId: string, item: any) {
    const count = await this.prisma.quoteItem.count({ where: { quoteId } });
    await this.prisma.quoteItem.create({
      data: {
        ...item,
        quoteId,
        totalPrice: item.quantity * item.unitPrice,
        sortOrder: count,
      },
    });
    await this.recalcTotals(quoteId);
    return this.findOne(quoteId);
  }

  async updateItem(itemId: string, data: any) {
    const item = await this.prisma.quoteItem.update({
      where: { id: itemId },
      data: { ...data, totalPrice: data.quantity * data.unitPrice },
    });
    await this.recalcTotals(item.quoteId);
    return item;
  }

  async removeItem(itemId: string) {
    const item = await this.prisma.quoteItem.delete({ where: { id: itemId } });
    await this.recalcTotals(item.quoteId);
    return { deleted: true };
  }

  async approve(id: string, approvedBy: string) {
    return this.prisma.quote.update({
      where: { id },
      data: { isApproved: true, approvedAt: new Date(), approvedBy },
    });
  }

  async update(id: string, data: any) {
    const updated = await this.prisma.quote.update({ where: { id }, data });
    await this.recalcTotals(id);
    return updated;
  }

  private async recalcTotals(quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });
    if (!quote) return;

    const subtotal = quote.items.reduce((s, i) => s + Number(i.totalPrice), 0);
    let discountAmt = 0;
    if (quote.discountType === 'percent') {
      discountAmt = subtotal * (Number(quote.discountValue) / 100);
    } else if (quote.discountType === 'fixed') {
      discountAmt = Number(quote.discountValue);
    }
    const afterDiscount = subtotal - discountAmt;
    const taxAmt = afterDiscount * (Number(quote.taxPercent) / 100);
    const grandTotal = afterDiscount + taxAmt;

    await this.prisma.quote.update({
      where: { id: quoteId },
      data: { subtotal, grandTotal },
    });
  }

  async generatePdfData(quoteId: string) {
    return this.findOne(quoteId);
  }
}
