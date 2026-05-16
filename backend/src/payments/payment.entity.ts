import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';

export enum PaymentType {
  DOWNPAYMENT = 'downpayment',
  MID_PAYMENT = 'mid_payment',
  BALANCE = 'balance',
  ADDON = 'addon',
  REFUND = 'refund',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  OVERDUE = 'overdue',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  GCASH = 'gcash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true, type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({ nullable: true, type: 'date' })
  dueDate: string;

  @Column({ nullable: true, type: 'date' })
  paidDate: string;

  @Column({ nullable: true })
  proofUrl: string; // S3 URL

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  recordedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
