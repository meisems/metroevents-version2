import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { MeetingStatus } from './meeting.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('meetings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private service: MeetingsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findAll(@Query('status') status?: MeetingStatus, @Query('search') search?: string) {
    return this.service.findAll(status, search);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  stats() { return this.service.getStats(); }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() dto: any) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  updateStatus(@Param('id') id: string, @Body('status') status: MeetingStatus) {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
