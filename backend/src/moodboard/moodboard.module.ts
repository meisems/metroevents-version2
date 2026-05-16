import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodboardController } from './moodboard.controller';
import { MoodboardService } from './moodboard.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([MoodboardPeg])],
  controllers: [MoodboardController],
  providers: [MoodboardService],
  exports: [MoodboardService],
})
export class MoodboardModule {}
