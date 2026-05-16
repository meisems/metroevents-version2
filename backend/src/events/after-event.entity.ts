import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToOne, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';

@Entity('after_events')
export class AfterEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  eventId: string;

  @OneToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  // 6-category star ratings (1-5)
  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingOverall: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingDesign: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingCoordination: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingOnTime: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingCrew: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingValue: number;

  @Column({ type: 'text', nullable: true })
  testimonial: string;

  @Column({ default: false })
  wouldRecommend: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  coordinatorNotes: string;

  @CreateDateColumn()
  createdAt: Date;
}
