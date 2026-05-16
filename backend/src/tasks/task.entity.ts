import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { UserRole } from '../users/user.entity';

export enum TaskStatus {
  TODO        = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE        = 'done',
  BLOCKED     = 'blocked',
}

export enum TaskPriority {
  LOW    = 'low',
  MEDIUM = 'medium',
  HIGH   = 'high',
  URGENT = 'urgent',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ nullable: true })
  assignedToId: string;

  @Column({ nullable: true })
  assignedToName: string;

  @Column({ nullable: true, type: 'enum', enum: UserRole })
  assignedRole: UserRole;

  @Column({ nullable: true, type: 'date' })
  dueDate: string;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  completedById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
