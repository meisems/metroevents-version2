// apps/api/src/clients/clients.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(@Query('q') q?: string, @Query('stage') stage?: string) {
    return this.clientsService.findAll(q, stage);
  }

  @Get('pipeline-counts')
  getPipelineCounts() {
    return this.clientsService.getPipelineCounts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  create(@Body() body: any) {
    return this.clientsService.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.clientsService.update(id, body);
  }

  @Patch(':id/advance-stage')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  advanceStage(@Param('id') id: string) {
    return this.clientsService.advanceStage(id);
  }

  @Patch(':id/set-stage')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  setStage(@Param('id') id: string, @Body('stage') stage: string) {
    return this.clientsService.setStage(id, stage);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
