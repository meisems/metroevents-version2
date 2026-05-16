import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';

export enum POStatus {
  PENDING = 'pending',
  DOWNPAID = 'downpaid',
  FULLY_PAID = 'fully_paid',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5.0 })
  rating: number;

  @Column({ default: 0 })
  onTimeCount: number;

  @Column({ default: 0 })
  lateCount: number;

  @Column({ default: 0 })
  issueCount: number;

  @Column({ default: false })
  isPreferred: boolean;

  @OneToMany(() => PurchaseOrder, (po) => po.supplier)
  purchaseOrders: PurchaseOrder[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get reliabilityPercent(): number {
    const total = this.onTimeCount + this.lateCount;
    if (total === 0) return 100;
    return Math.round((this.onTimeCount / total) * 100);
  }
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  poNumber: string;

  @Column()
  supplierId: string;

  @ManyToOne(() => Supplier, (s) => s.purchaseOrders)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column({ nullable: true })
  eventId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: POStatus, default: POStatus.PENDING })
  status: POStatus;

  @Column({ nullable: true, type: 'date' })
  deliveryDate: string;

  @Column({ nullable: true })
  deliveryTimeWindow: string;

  @Column({ nullable: true })
  actualDeliveryAt: Date;

  @Column({ default: false })
  deliveredOnTime: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  downpaymentAmount: number;

  @Column({ nullable: true, type: 'date' })
  downpaymentDate: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({ nullable: true, type: 'date' })
  balanceDate: string;

  @Column({ nullable: true })
  proofUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
