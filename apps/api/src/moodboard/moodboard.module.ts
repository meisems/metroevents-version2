import { Module } from '@nestjs/common';
import { MoodboardService } from './moodboard.service';
import { MoodboardController } from './moodboard.controller';
@Module({ providers: [MoodboardService], controllers: [MoodboardController] })
export class MoodboardModule {}
