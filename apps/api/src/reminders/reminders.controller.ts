// apps/api/src/reminders/reminders.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';

@ApiTags('Reminders')
@ApiBearerAuth()
@Controller('reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'coordinator')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  getAllReminders() {
    return this.remindersService.getAllReminders();
  }

  @Get('templates')
  getTemplates() {
    return this.remindersService.getTemplates();
  }

  @Post('templates/render')
  renderTemplate(@Body() body: { key: string; vars: Record<string, string> }) {
    return { message: this.remindersService.renderTemplate(body.key, body.vars) };
  }

  @Get('overdue-payments')
  getOverduePayments() {
    return this.remindersService.getOverduePayments();
  }

  @Get('upcoming-events')
  getUpcomingEvents(@Query('days') days?: string) {
    return this.remindersService.getUpcomingEventReminders(days ? +days : 3);
  }

  @Get('stale-leads')
  getStaleLeads(@Query('days') days?: string) {
    return this.remindersService.getStaleLeads(days ? +days : 14);
  }
}
