import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('monthly-revenue')
  monthlyRevenue(@Query('year') year: string) {
    return this.service.monthlyBookingsRevenue(year ? +year : new Date().getFullYear());
  }

  @Get('crm-funnel')
  crmFunnel() { return this.service.crmFunnel(); }

  @Get('events-by-type')
  eventsByType() { return this.service.eventsByType(); }

  @Get('top-revenue-events')
  topRevenue(@Query('limit') limit?: string) {
    return this.service.topRevenueEvents(limit ? +limit : 5);
  }

  @Get('post-event-ratings')
  postEventRatings() { return this.service.postEventRatings(); }

  @Get('inventory-utilization')
  inventoryUtilization() { return this.service.inventoryUtilization(); }

  @Get('supplier-performance')
  supplierPerformance() { return this.service.supplierPerformance(); }

  @Get('feedback-scores')
  feedbackScores() { return this.service.feedbackScores(); }
}
