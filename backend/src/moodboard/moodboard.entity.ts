import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';

export enum MoodboardCategory {
  OVERALL_THEME   = 'overall_theme',
  FLOWERS         = 'flowers',
  BACKDROP        = 'backdrop',
  TABLE_SETTING   = 'table_setting',
  LIGHTING        = 'lighting',
  COLOR_PALETTE   = 'color_palette',
  VENUE_LAYOUT    = 'venue_layout',
  BRIDE_LOOK      = 'bride_look',
  CLIENT_UPLOADED = 'client_uploaded',
  APPROVED_FINAL  = 'approved_final',
}

@Entity('moodboard_pegs')
export class MoodboardPeg {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ type: 'enum', enum: MoodboardCategory, default: MoodboardCategory.OVERALL_THEME })
  category: MoodboardCategory;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  sourceUrl: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isClientUploaded: boolean;

  @Column({ nullable: true })
  uploadedById: string;

  @Column({ nullable: true })
  approvedById: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
