import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private service: InventoryService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.WAREHOUSE)
  findAll() { return this.service.findAll(); }

  @Get('availability')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.WAREHOUSE)
  availability(@Query('itemId') itemId: string, @Query('date') date: string) {
    return this.service.checkAvailability(itemId, date);
  }

  @Get('reservations')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.WAREHOUSE)
  reservationsByEvent(@Query('eventId') eventId: string) {
    return this.service.findReservationsByEvent(eventId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.WAREHOUSE)
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  create(@Body() dto: CreateInventoryItemDto) { return this.service.create(dto); }

  @Post('reservations')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.WAREHOUSE)
  reserve(@Body() dto: CreateReservationDto) { return this.service.reserve(dto); }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  update(@Param('id') id: string, @Body() dto: Partial<CreateInventoryItemDto>) {
    return this.service.update(id, dto);
  }

  @Patch('reservations/:id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  updateReservation(@Param('id') id: string, @Body() data: any) {
    return this.service.updateReservation(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
