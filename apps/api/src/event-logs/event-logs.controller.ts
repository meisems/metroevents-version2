// apps/api/src/event-logs/event-logs.controller.ts
import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventLogsService } from './event-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/index';

@ApiTags('Event Logs')
@ApiBearerAuth()
@Controller('event-logs')
@UseGuards(JwtAuthGuard)
export class EventLogsController {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.eventLogsService.findByEvent(eventId);
  }

  @Get('event/:eventId/timeline')
  getTimeline(@Param('eventId') eventId: string) {
    return this.eventLogsService.getTimeline(eventId);
  }

  @Post()
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.eventLogsService.create(body, user.id);
  }

  @Patch(':id/approve')
  approveChangeRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventLogsService.approveChangeRequest(id, user.name);
  }
}
