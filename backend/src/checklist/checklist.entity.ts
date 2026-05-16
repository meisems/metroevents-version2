import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';

export enum ChecklistPhase {
  PRE_PRODUCTION = 'pre_production',
  FABRICATION    = 'fabrication',
  SUPPLIER       = 'supplier',
  LOAD_IN        = 'load_in',
  EVENT_DAY      = 'event_day',
  LOAD_OUT       = 'load_out',
  POST_EVENT     = 'post_event',
}

export enum ChecklistRole {
  COORDINATOR = 'coordinator',
  DESIGNER    = 'designer',
  WAREHOUSE   = 'warehouse',
}

@Entity('checklist_items')
export class ChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'enum', enum: ChecklistPhase, default: ChecklistPhase.PRE_PRODUCTION })
  phase: ChecklistPhase;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ChecklistRole, nullable: true })
  responsibleRole: ChecklistRole;

  @Column({ nullable: true, type: 'date' })
  dueDate: string;

  @Column({ default: false })
  isDone: boolean;

  @Column({ nullable: true })
  checkedById: string;

  @Column({ nullable: true })
  checkedByName: string;

  @Column({ nullable: true })
  checkedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
