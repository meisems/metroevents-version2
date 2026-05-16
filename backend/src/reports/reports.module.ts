import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Event } from '../events/event.entity';
import { Payment } from '../payments/payment.entity';
import { Client } from '../clients/client.entity';
import { InventoryItem } from '../inventory/inventory.entity';
import { Supplier } from '../suppliers/supplier.entity';
import { AfterEvent } from '../portal/after-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Payment, Client, InventoryItem, Supplier, AfterEvent])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
