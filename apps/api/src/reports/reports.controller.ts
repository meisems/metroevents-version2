// apps/api/src/reports/reports.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'coordinator')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('revenue-by-month')
  getRevenueByMonth(@Query('year') year?: string) {
    return this.reportsService.getRevenueByMonth(year ? +year : undefined);
  }

  @Get('events-by-month')
  getEventsByMonth(@Query('year') year?: string) {
    return this.reportsService.getEventsByMonth(year ? +year : undefined);
  }

  @Get('top-clients')
  getTopClients(@Query('limit') limit?: string) {
    return this.reportsService.getTopClients(limit ? +limit : 10);
  }

  @Get('stale-leads')
  getStaleLeads(@Query('days') days?: string) {
    return this.reportsService.getStaleLeads(days ? +days : 14);
  }
}
