import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus, EventType } from './event.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private service: EventsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER, UserRole.WAREHOUSE)
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'status', enum: EventStatus, required: false })
  @ApiQuery({ name: 'type', enum: EventType, required: false })
  findAll(
    @Query('clientId') clientId?: string,
    @Query('status') status?: EventStatus,
    @Query('type') type?: EventType,
  ) {
    return this.service.findAll(clientId, status, type);
  }

  @Get('upcoming')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  upcoming(@Query('days') days?: string) {
    return this.service.upcoming(days ? +days : 7);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER, UserRole.WAREHOUSE)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() dto: CreateEventDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/advance-status')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  advanceStatus(@Param('id') id: string) {
    return this.service.advanceStatus(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
