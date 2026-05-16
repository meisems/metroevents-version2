import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem, InventoryReservation, ReservationStatus } from './inventory.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem) private itemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryReservation) private resRepo: Repository<InventoryReservation>,
  ) {}

  findAll() {
    return this.itemRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.itemRepo.findOne({ where: { id }, relations: ['reservations'] });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async create(dto: CreateInventoryItemDto): Promise<InventoryItem> {
    return this.itemRepo.save(this.itemRepo.create(dto));
  }

  async update(id: string, dto: Partial<CreateInventoryItemDto>): Promise<InventoryItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.itemRepo.remove(item);
  }

  /** Check availability for a specific date */
  async checkAvailability(itemId: string, date: string): Promise<{ available: number }> {
    const item = await this.findOne(itemId);
    const reservedQty = await this.resRepo
      .createQueryBuilder('r')
      .select('SUM(r.quantity)', 'total')
      .where('r.itemId = :itemId', { itemId })
      .andWhere('r.reservedDate = :date', { date })
      .andWhere('r.status IN (:...statuses)', {
        statuses: [ReservationStatus.RESERVED, ReservationStatus.CHECKED_OUT],
      })
      .getRawOne();

    const reserved = Number(reservedQty?.total || 0);
    return { available: item.totalQuantity - reserved };
  }

  async reserve(dto: CreateReservationDto): Promise<InventoryReservation> {
    const avail = await this.checkAvailability(dto.itemId, dto.reservedDate);
    if (avail.available < dto.quantity) {
      throw new BadRequestException(
        `Only ${avail.available} units available on ${dto.reservedDate}`,
      );
    }
    return this.resRepo.save(this.resRepo.create(dto));
  }

  async updateReservation(
    id: string,
    data: Partial<InventoryReservation>,
  ): Promise<InventoryReservation> {
    const res = await this.resRepo.findOneBy({ id });
    if (!res) throw new NotFoundException('Reservation not found');
    Object.assign(res, data);
    return this.resRepo.save(res);
  }

  findReservationsByEvent(eventId: string) {
    return this.resRepo.find({
      where: { eventId },
      relations: ['item'],
    });
  }
}
