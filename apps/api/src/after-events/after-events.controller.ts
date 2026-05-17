// apps/api/src/after-events/after-events.controller.ts
import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AfterEventsService } from './after-events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('After Events')
@ApiBearerAuth()
@Controller('after-events')
@UseGuards(JwtAuthGuard)
export class AfterEventsController {
  constructor(private readonly afterEventsService: AfterEventsService) {}

  @Get('ratings')
  getAverageRatings() {
    return this.afterEventsService.getAverageRatings();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.afterEventsService.findByEvent(eventId);
  }

  @Post('event/:eventId')
  upsert(@Param('eventId') eventId: string, @Body() body: any) {
    return this.afterEventsService.upsert(eventId, body);
  }

  @Post('event/:eventId/client-feedback')
  submitClientFeedback(@Param('eventId') eventId: string, @Body() body: any) {
    return this.afterEventsService.submitClientFeedback(eventId, body);
  }
}
