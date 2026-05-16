import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Event } from '../events/event.entity';

export enum CRMStage {
  NEW_INQUIRY = 'new_inquiry',
  OCULAR_SCHEDULED = 'ocular_scheduled',
  PROPOSAL_SENT = 'proposal_sent',
  RESERVED = 'reserved',
  FULLY_BOOKED = 'fully_booked',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  referralSource: string;

  @Column({ type: 'enum', enum: CRMStage, default: CRMStage.NEW_INQUIRY })
  stage: CRMStage;

  @Column({ nullable: true })
  ocularDate: Date;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ nullable: true })
  lastContactedAt: Date;

  @OneToMany(() => Event, (event) => event.client)
  events: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
