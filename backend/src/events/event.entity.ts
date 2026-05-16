import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Client } from '../clients/client.entity';

export enum EventStatus {
  PLANNING = 'planning',
  PRODUCTION = 'production',
  READY = 'ready',
  EVENT_DAY = 'event_day',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum EventType {
  WEDDING = 'wedding',
  DEBUT = 'debut',
  BIRTHDAY = 'birthday',
  CORPORATE = 'corporate',
  SPECIAL = 'special',
  OTHER = 'other',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: EventType, default: EventType.OTHER })
  type: EventType;

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PLANNING })
  status: EventStatus;

  @Column({ type: 'date' })
  eventDate: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  venueAddress: string;

  @Column({ nullable: true, type: 'int' })
  guestCount: number;

  @Column({ nullable: true })
  packageName: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Client, (client) => client.events, { nullable: false })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  coordinatorId: string;

  @Column({ nullable: true })
  designerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed
  get balance(): number {
    return Number(this.totalAmount) - Number(this.totalPaid);
  }
}
