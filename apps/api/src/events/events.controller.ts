// apps/api/src/events/events.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService, CreateEventDto, UpdateEventDto, EventQueryDto } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';
import { CurrentUser } from '../auth/decorators/index';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Query() query: EventQueryDto, @CurrentUser() user: any) {
    return this.eventsService.findAll(query, user.role, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/financial-summary')
  getFinancialSummary(@Param('id') id: string) {
    return this.eventsService.getFinancialSummary(id);
  }

  @Post()
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Patch(':id')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.eventsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
