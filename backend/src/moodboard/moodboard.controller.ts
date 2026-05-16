import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MoodboardService } from './moodboard.service';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('moodboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('moodboard')
export class MoodboardController {
  constructor(
    private service: MoodboardService,
    private storage: StorageService,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER, UserRole.CLIENT)
  byEvent(@Query('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER, UserRole.CLIENT)
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() dto: any, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    let imageUrl = dto.imageUrl;
    if (file) {
      imageUrl = await this.storage.upload(file, `moodboard/${dto.eventId}`);
    }
    return this.service.create({
      ...dto,
      imageUrl,
      uploadedById: req.user.id,
      isClientUploaded: req.user.role === UserRole.CLIENT,
    });
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER)
  approve(@Param('id') id: string, @Req() req: any) {
    return this.service.approve(id, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
