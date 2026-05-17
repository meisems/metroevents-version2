// apps/api/src/tasks/tasks.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/index';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.tasksService.findByEvent(eventId);
  }

  @Post()
  create(@Body() body: any) {
    return this.tasksService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.complete(id, user.id);
  }

  @Patch(':id/uncomplete')
  uncomplete(@Param('id') id: string) {
    return this.tasksService.uncomplete(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
