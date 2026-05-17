// apps/api/src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalClients,
      totalEvents,
      activeEvents,
      upcomingEvents,
      overduePayments,
      monthRevenue,
      yearRevenue,
      pipelineCounts,
      eventTypeCounts,
      avgRatings,
    ] = await Promise.all([
      this.prisma.client.count(),
      this.prisma.event.count(),
      this.prisma.event.count({ where: { status: { in: ['planning', 'production', 'ready'] } } }),
      this.prisma.event.count({ where: { eventDate: { gte: now } } }),
      this.prisma.payment.count({ where: { status: 'pending', dueDate: { lt: now } } }),
      this.prisma.payment.aggregate({
        where: { status: 'paid', paidDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'paid', paidDate: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      this.prisma.client.groupBy({ by: ['pipelineStage'], _count: true }),
      this.prisma.event.groupBy({ by: ['eventType'], _count: true }),
      this.prisma.afterEvent.aggregate({
        where: { ratingOverall: { not: null } },
        _avg: { ratingOverall: true, ratingDesign: true, ratingCoordination: true },
        _count: { ratingOverall: true },
      }),
    ]);

    return {
      totalClients,
      totalEvents,
      activeEvents,
      upcomingEvents,
      overduePayments,
      monthRevenue: Number(monthRevenue._sum.amount ?? 0),
      yearRevenue: Number(yearRevenue._sum.amount ?? 0),
      pipeline: Object.fromEntries(pipelineCounts.map((p) => [p.pipelineStage, p._count])),
      eventTypes: Object.fromEntries(eventTypeCounts.map((e) => [e.eventType, e._count])),
      avgRatings,
    };
  }

  async getRevenueByMonth(year?: number) {
    const y = year ?? new Date().getFullYear();
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'paid',
        paidDate: {
          gte: new Date(`${y}-01-01`),
          lt: new Date(`${y + 1}-01-01`),
        },
      },
      select: { paidDate: true, amount: true },
    });

    const byMonth: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) byMonth[m] = 0;
    for (const p of payments) {
      const month = new Date(p.paidDate!).getMonth() + 1;
      byMonth[month] = (byMonth[month] ?? 0) + Number(p.amount);
    }
    return byMonth;
  }

  async getEventsByMonth(year?: number) {
    const y = year ?? new Date().getFullYear();
    const events = await this.prisma.event.findMany({
      where: {
        eventDate: {
          gte: new Date(`${y}-01-01`),
          lt: new Date(`${y + 1}-01-01`),
        },
      },
      select: { eventDate: true, eventType: true },
    });

    const byMonth: Record<number, number> = {};
    for (let m = 1; m <= 12; m++) byMonth[m] = 0;
    for (const e of events) {
      const month = new Date(e.eventDate).getMonth() + 1;
      byMonth[month] = (byMonth[month] ?? 0) + 1;
    }
    return byMonth;
  }

  async getTopClients(limit = 10) {
    const clients = await this.prisma.client.findMany({
      include: {
        events: {
          include: {
            payments: { where: { status: 'paid' }, select: { amount: true } },
          },
        },
      },
    });

    return clients
      .map((c) => ({
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        eventCount: c.events.length,
        totalPaid: c.events.reduce(
          (sum, e) => sum + e.payments.reduce((s, p) => s + Number(p.amount), 0),
          0,
        ),
      }))
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, limit);
  }

  async getStaleLeads(daysSinceContact = 14) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysSinceContact);

    return this.prisma.client.findMany({
      where: {
        pipelineStage: { in: ['new_inquiry', 'ocular_scheduled', 'proposal_sent'] },
        OR: [
          { lastContacted: { lt: cutoff } },
          { lastContacted: null, inquiryDate: { lt: cutoff } },
        ],
      },
      orderBy: { lastContacted: 'asc' },
    });
  }
}
