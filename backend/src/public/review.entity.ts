import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientName: string;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true })
  eventId: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ nullable: true })
  publishedById: string;

  @CreateDateColumn()
  createdAt: Date;
}
