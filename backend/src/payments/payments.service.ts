import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Payment, PaymentStatus } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { addDays, formatISO } from 'date-fns';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private repo: Repository<Payment>) {}

  async findByEvent(eventId: string): Promise<Payment[]> {
    return this.repo.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const p = await this.repo.findOneBy({ id });
    if (!p) throw new NotFoundException('Payment not found');
    return p;
  }

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.repo.create(dto);
    return this.repo.save(payment);
  }

  async markPaid(id: string, paidDate?: string): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = PaymentStatus.PAID;
    payment.paidDate = paidDate || new Date().toISOString().split('T')[0];
    return this.repo.save(payment);
  }

  async update(id: string, dto: Partial<CreatePaymentDto>): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);
    return this.repo.save(payment);
  }

  async remove(id: string): Promise<void> {
    const p = await this.findOne(id);
    await this.repo.remove(p);
  }

  /** Smart reminder data */
  async getOverdue(): Promise<Payment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.repo.find({
      where: { dueDate: LessThan(today), status: PaymentStatus.PENDING },
      relations: ['event'],
    });
  }

  async getDueSoon(days = 3): Promise<Payment[]> {
    const today = new Date().toISOString().split('T')[0];
    const future = addDays(new Date(), days).toISOString().split('T')[0];
    return this.repo.find({
      where: {
        dueDate: Between(today, future),
        status: PaymentStatus.PENDING,
      },
      relations: ['event'],
    });
  }
}
