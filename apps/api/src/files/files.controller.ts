// apps/api/src/files/files.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/index';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('event/:eventId')
  findByEvent(
    @Param('eventId') eventId: string,
    @Query('clientVisible') clientVisible?: string,
  ) {
    const vis = clientVisible === 'true' ? true : clientVisible === 'false' ? false : undefined;
    return this.filesService.findByEvent(eventId, vis);
  }

  @Post('event/:eventId')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string,
    @Body('description') description: string,
    @CurrentUser() user: any,
  ) {
    return this.filesService.upload(eventId, file, category || 'other', description, user.id);
  }

  @Get(':id/signed-url')
  getSignedUrl(@Param('id') id: string) {
    return this.filesService.getSignedUrl(id);
  }

  @Patch(':id/toggle-visibility')
  toggleClientVisible(@Param('id') id: string) {
    return this.filesService.toggleClientVisible(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
