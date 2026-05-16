import {
  Controller, Get, Post, Delete, Body, Param, Query,
  Req, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventLogService } from './event-log.service';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('event-log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('event-log')
export class EventLogController {
  constructor(private service: EventLogService, private storage: StorageService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  byEvent(@Query('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() dto: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    let photoUrl: string | undefined;
    if (file) {
      photoUrl = await this.storage.upload(file, `event-log/${dto.eventId}`);
    }
    return this.service.create(
      { ...dto, photoUrl },
      req.user.id,
      `${req.user.firstName} ${req.user.lastName}`,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.id, req.user.role);
  }
}
