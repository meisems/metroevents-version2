// apps/api/src/moodboard/moodboard.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MoodboardService } from './moodboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';
import { CurrentUser } from '../auth/decorators/index';

@ApiTags('Moodboard')
@ApiBearerAuth()
@Controller('moodboard')
@UseGuards(JwtAuthGuard)
export class MoodboardController {
  constructor(private readonly moodboardService: MoodboardService) {}

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.moodboardService.findByEvent(eventId);
  }

  @Post('event/:eventId/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadPeg(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption: string,
    @Body('category') category: string,
    @CurrentUser() user: any,
  ) {
    return this.moodboardService.uploadPeg(eventId, file, user.id, caption, category);
  }

  @Patch(':id/approve')
  @Roles('admin', 'coordinator', 'designer')
  @UseGuards(RolesGuard)
  approve(@Param('id') id: string) {
    return this.moodboardService.approve(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.moodboardService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moodboardService.remove(id);
  }
}
