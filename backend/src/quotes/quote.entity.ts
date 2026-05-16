import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ default: 1 })
  version: number;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isApprovedByClient: boolean;

  @Column({ nullable: true })
  approvedByClientAt: Date;

  @Column({ nullable: true })
  approvedByClientName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'enum', enum: DiscountType, default: DiscountType.FIXED })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountValue: number;

  @Column({ nullable: true })
  discountReason: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  grandTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  downpaymentAmount: number;

  @Column({ nullable: true, type: 'date' })
  downpaymentDueDate: string;

  @Column({ nullable: true, type: 'date' })
  balanceDueDate: string;

  @Column({ type: 'text', nullable: true })
  inclusions: string;

  @Column({ type: 'text', nullable: true })
  exclusions: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @OneToMany(() => QuoteLineItem, (item) => item.quote, { cascade: true, eager: true })
  lineItems: QuoteLineItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum LineItemUnit {
  PC = 'pc',
  SET = 'set',
  LOT = 'lot',
  HR = 'hr',
  DAY = 'day',
}

@Entity('quote_line_items')
export class QuoteLineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quoteId: string;

  @ManyToOne(() => Quote, (q) => q.lineItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quoteId' })
  quote: Quote;

  @Column()
  category: string;

  @Column()
  itemName: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'enum', enum: LineItemUnit, default: LineItemUnit.PC })
  unit: LineItemUnit;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: 0 })
  sortOrder: number;
}
