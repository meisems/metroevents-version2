import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';

export enum ItemCategory {
  BACKDROP = 'backdrop',
  DRAPING = 'draping',
  LIGHTS = 'lights',
  FLOWERS = 'flowers',
  FURNITURE = 'furniture',
  TABLEWARE = 'tableware',
  LINEN = 'linen',
  SIGNAGE = 'signage',
  PROPS = 'props',
  EQUIPMENT = 'equipment',
  OTHER = 'other',
}

export enum ItemCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  DAMAGED = 'damaged',
  MISSING = 'missing',
}

export enum ReservationStatus {
  RESERVED = 'reserved',
  CHECKED_OUT = 'checked_out',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ItemCategory })
  category: ItemCategory;

  @Column({ type: 'int', default: 1 })
  totalQuantity: number;

  @Column({ type: 'int', default: 1 })
  availableQuantity: number;

  @Column({ nullable: true })
  storageLocation: string;

  @Column({ nullable: true })
  dimensions: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  replacementCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rentalPrice: number;

  @Column({ type: 'enum', enum: ItemCondition, default: ItemCondition.GOOD })
  condition: ItemCondition;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => InventoryReservation, (r) => r.item)
  reservations: InventoryReservation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('inventory_reservations')
export class InventoryReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  itemId: string;

  @Column()
  eventId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'date' })
  reservedDate: string;

  @Column({ type: 'enum', enum: ReservationStatus, default: ReservationStatus.RESERVED })
  status: ReservationStatus;

  @Column({ nullable: true, type: 'enum', enum: ItemCondition })
  conditionOnCheckout: ItemCondition;

  @Column({ nullable: true, type: 'enum', enum: ItemCondition })
  conditionOnReturn: ItemCondition;

  @Column({ type: 'text', nullable: true })
  returnNotes: string;

  @Column({ nullable: true })
  checkedOutAt: Date;

  @Column({ nullable: true })
  returnedAt: Date;

  @ManyToOne(() => InventoryItem, (item) => item.reservations)
  item: InventoryItem;

  @CreateDateColumn()
  createdAt: Date;
}

import { ManyToOne } from 'typeorm';
