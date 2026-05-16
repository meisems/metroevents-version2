import {
  Controller, Get, Post, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private service: RemindersService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  dashboard() { return this.service.getDashboard(); }

  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  templates() { return this.service.getTemplates(); }

  @Post('fill-template')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  fillTemplate(@Body('templateId') templateId: string, @Body('data') data: Record<string, string>) {
    return this.service.fillTemplate(templateId, data);
  }
}
