import {
  Controller, Get, Post, Delete, Param, Query, Req, Body,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('files')
export class FilesController {
  constructor(private service: FilesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  byEvent(@Query('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Body('eventId') eventId: string,
    @Body('label') label: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.service.upload(eventId, file, label, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
