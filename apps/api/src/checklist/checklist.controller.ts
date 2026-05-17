// apps/api/src/checklist/checklist.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChecklistService } from './checklist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/index';

@ApiTags('Checklist')
@ApiBearerAuth()
@Controller('checklist')
@UseGuards(JwtAuthGuard)
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.checklistService.findByEvent(eventId);
  }

  @Get('event/:eventId/progress')
  getProgress(@Param('eventId') eventId: string) {
    return this.checklistService.getProgress(eventId);
  }

  @Post()
  create(@Body() body: any) {
    return this.checklistService.create(body);
  }

  @Post('event/:eventId/apply-template')
  applyTemplate(@Param('eventId') eventId: string, @Body('template') template: string) {
    return this.checklistService.applyTemplate(eventId, template);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.checklistService.update(id, body);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @CurrentUser() user: any) {
    return this.checklistService.toggle(id, user.name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checklistService.remove(id);
  }
}
