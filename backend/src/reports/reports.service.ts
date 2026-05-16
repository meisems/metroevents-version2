import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus, EventType } from '../events/event.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { Client, CRMStage } from '../clients/client.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { Supplier } from '../suppliers/supplier.entity';
import { AfterEvent } from '../portal/after-event.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(Client) private clientsRepo: Repository<Client>,
    @InjectRepository(InventoryItem) private inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(Supplier) private suppliersRepo: Repository<Supplier>,
    @InjectRepository(AfterEvent) private afterEventRepo: Repository<AfterEvent>,
  ) {}

  async monthlyBookingsRevenue(year: number) {
    const rows = await this.paymentsRepo
      .createQueryBuilder('p')
      .select("DATE_TRUNC('month', p.paidDate) as month")
      .addSelect('SUM(p.amount)', 'revenue')
      .addSelect('COUNT(DISTINCT p.eventId)', 'bookings')
      .where('p.status = :status', { status: PaymentStatus.PAID })
      .andWhere("EXTRACT(YEAR FROM p.paidDate) = :year", { year })
      .groupBy("DATE_TRUNC('month', p.paidDate)")
      .orderBy("month", 'ASC')
      .getRawMany();
    return rows;
  }

  async crmFunnel() {
    const counts: Record<string, number> = {};
    for (const stage of Object.values(CRMStage)) {
      counts[stage] = await this.clientsRepo.countBy({ stage });
    }
    const total = Object.values(counts).reduce((s, v) => s + v, 0);
    const converted = counts[CRMStage.FULLY_BOOKED] + counts[CRMStage.DONE];
    return {
      counts,
      conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
    };
  }

  async eventsByType() {
    const results = await this.eventsRepo
      .createQueryBuilder('e')
      .select('e.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('e.status != :cancelled', { cancelled: EventStatus.CANCELLED })
      .groupBy('e.type')
      .getRawMany();
    return results;
  }

  async topRevenueEvents(limit = 5) {
    return this.eventsRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.client', 'client')
      .where('e.status != :cancelled', { cancelled: EventStatus.CANCELLED })
      .orderBy('e.totalPaid', 'DESC')
      .limit(limit)
      .getMany();
  }

  async postEventRatings() {
    const result = await this.afterEventRepo
      .createQueryBuilder('a')
      .select('AVG(a.ratingOverall)', 'overall')
      .addSelect('AVG(a.ratingDesign)', 'design')
      .addSelect('AVG(a.ratingCoordination)', 'coordination')
      .addSelect('AVG(a.ratingOnTime)', 'onTime')
      .addSelect('AVG(a.ratingCrew)', 'crew')
      .addSelect('AVG(a.ratingValue)', 'value')
      .addSelect('COUNT(*)', 'count')
      .getRawOne();
    return result;
  }

  async inventoryUtilization() {
    const items = await this.inventoryRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.reservations', 'r')
      .getMany();

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      totalQuantity: item.totalQuantity,
      reservationCount: item.reservations.length,
      isDeadStock: item.reservations.length === 0,
    }));
  }

  async supplierPerformance() {
    const suppliers = await this.suppliersRepo.find({
      order: { onTimeCount: 'DESC' },
    });
    return suppliers.map((s) => {
      const total = s.onTimeCount + s.lateCount;
      return {
        id: s.id,
        companyName: s.companyName,
        category: s.category,
        rating: s.rating,
        onTimeCount: s.onTimeCount,
        lateCount: s.lateCount,
        issueCount: s.issueCount,
        reliabilityPercent: total > 0 ? Math.round((s.onTimeCount / total) * 100) : 100,
        isPreferred: s.isPreferred,
      };
    });
  }

  async feedbackScores() {
    return this.afterEventRepo.find({
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }
}
