import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findAll() { return this.service.findAll(); }

  @Get('pos')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  posByEvent(@Query('eventId') eventId: string) {
    return this.service.findPOsByEvent(eventId);
  }

  @Get('pos/today')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  posToday() { return this.service.findPOsToday(); }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() dto: any) { return this.service.create(dto); }

  @Post('pos')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  createPO(@Body() dto: any) { return this.service.createPO(dto); }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Patch('pos/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  updatePO(@Param('id') id: string, @Body() dto: any) { return this.service.updatePO(id, dto); }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Delete('pos/:id')
  @Roles(UserRole.ADMIN)
  removePO(@Param('id') id: string) { return this.service.removePO(id); }
}
