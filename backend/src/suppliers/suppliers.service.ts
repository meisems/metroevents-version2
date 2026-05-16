import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier, PurchaseOrder } from './supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
  ) {}

  findAll() {
    return this.supplierRepo.find({ order: { companyName: 'ASC' } });
  }

  async findOne(id: string): Promise<Supplier> {
    const s = await this.supplierRepo.findOne({
      where: { id }, relations: ['purchaseOrders'],
    });
    if (!s) throw new NotFoundException('Supplier not found');
    return s;
  }

  async create(dto: any): Promise<Supplier> {
    return this.supplierRepo.save(this.supplierRepo.create(dto));
  }

  async update(id: string, dto: any): Promise<Supplier> {
    const s = await this.findOne(id);
    Object.assign(s, dto);
    return this.supplierRepo.save(s);
  }

  async remove(id: string): Promise<void> {
    const s = await this.findOne(id);
    await this.supplierRepo.remove(s);
  }

  /* ---- Purchase Orders ---- */
  async findPOsByEvent(eventId: string) {
    return this.poRepo.find({ where: { eventId }, relations: ['supplier'] });
  }

  async findPOsToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.poRepo.find({ where: { deliveryDate: today }, relations: ['supplier', 'event' as any] });
  }

  async createPO(dto: any): Promise<PurchaseOrder> {
    return this.poRepo.save(this.poRepo.create(dto));
  }

  async updatePO(id: string, dto: any): Promise<PurchaseOrder> {
    const po = await this.poRepo.findOneBy({ id });
    if (!po) throw new NotFoundException('Purchase order not found');
    const wasDelivered = !po.actualDeliveryAt && dto.actualDeliveryAt;
    Object.assign(po, dto);

    // Update supplier reliability stats
    if (wasDelivered && po.supplierId) {
      const supplier = await this.supplierRepo.findOneBy({ id: po.supplierId });
      if (supplier) {
        if (po.deliveredOnTime) supplier.onTimeCount++;
        else supplier.lateCount++;
        await this.supplierRepo.save(supplier);
      }
    }
    return this.poRepo.save(po);
  }

  async removePO(id: string): Promise<void> {
    const po = await this.poRepo.findOneBy({ id });
    if (!po) throw new NotFoundException('Purchase order not found');
    await this.poRepo.remove(po);
  }
}
