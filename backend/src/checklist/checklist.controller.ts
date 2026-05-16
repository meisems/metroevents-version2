import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChecklistService } from './checklist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('checklist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('checklist')
export class ChecklistController {
  constructor(private service: ChecklistService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER, UserRole.WAREHOUSE)
  byEvent(@Query('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() dto: any) { return this.service.create(dto); }

  @Post('load-template')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  loadTemplate(@Body('eventId') eventId: string, @Body('type') type: any) {
    return this.service.loadTemplate(eventId, type);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.DESIGNER, UserRole.WAREHOUSE)
  toggle(@Param('id') id: string, @Req() req: any) {
    return this.service.toggle(id, req.user.id, `${req.user.firstName} ${req.user.lastName}`);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
