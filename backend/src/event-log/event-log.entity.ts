import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';

export enum LogType {
  NOTE           = 'note',
  INCIDENT       = 'incident',
  CHANGE_REQUEST = 'change_request',
  CLIENT_APPROVAL= 'client_approval',
  SIGN_OFF       = 'sign_off',
  TIMELINE_TICK  = 'timeline_tick',
}

@Entity('event_logs')
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'enum', enum: LogType, default: LogType.NOTE })
  logType: LogType;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  photoUrl: string;

  /** For change_request entries */
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costImpact: number;

  @Column({ nullable: true })
  clientSignOffName: string;

  @Column({ nullable: true })
  loggedById: string;

  @Column({ nullable: true })
  loggedByName: string;

  @CreateDateColumn()
  createdAt: Date;
}
