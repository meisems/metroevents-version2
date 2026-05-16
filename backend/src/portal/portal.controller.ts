import {
  Controller, Get, Post, Patch, Param, Body, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PortalService } from './portal.service';
import { QuotesService } from '../quotes/quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT)
@Controller('portal')
export class PortalController {
  constructor(
    private portal: PortalService,
    private quotes: QuotesService,
  ) {}

  @Get('events')
  myEvents(@Req() req: any) {
    return this.portal.getMyEvents(req.user.linkedClientId);
  }

  @Get('events/:eventId/quote')
  myQuote(@Param('eventId') eventId: string, @Req() req: any) {
    return this.portal.getMyQuote(eventId, req.user.linkedClientId);
  }

  @Patch('quotes/:id/approve')
  approveQuote(@Param('id') id: string, @Req() req: any) {
    return this.quotes.approveByClient(id, req.user.firstName + ' ' + req.user.lastName);
  }

  @Get('events/:eventId/payments')
  myPayments(@Param('eventId') eventId: string, @Req() req: any) {
    return this.portal.getMyPayments(eventId, req.user.linkedClientId);
  }

  @Get('events/:eventId/moodboard')
  myMoodboard(@Param('eventId') eventId: string, @Req() req: any) {
    return this.portal.getMyMoodboard(eventId, req.user.linkedClientId);
  }

  @Post('events/:eventId/feedback')
  submitFeedback(
    @Param('eventId') eventId: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    return this.portal.submitFeedback(eventId, req.user.linkedClientId, dto);
  }
}
