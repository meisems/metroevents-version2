// apps/api/src/inventory/inventory.controller.ts
import {
  Controller, Get, Post, Patch, Body, Param,
  Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Query('q') q?: string, @Query('category') category?: string) {
    return this.inventoryService.findAll(q, category);
  }

  @Get('categories')
  getCategories() {
    return this.inventoryService.getCategories();
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: string) {
    return this.inventoryService.getLowStock(threshold ? +threshold : 5);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Get(':id/availability')
  getAvailability(
    @Param('id') id: string,
    @Query('from') from: string,
    @Query('until') until: string,
  ) {
    return this.inventoryService.getAvailability(id, new Date(from), new Date(until));
  }

  @Post()
  @Roles('admin', 'warehouse')
  @UseGuards(RolesGuard)
  create(@Body() body: any) {
    return this.inventoryService.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'warehouse')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.inventoryService.update(id, body);
  }

  @Post('reservations')
  createReservation(@Body() body: any) {
    return this.inventoryService.createReservation(body);
  }

  @Patch('reservations/:id/checkout')
  @Roles('admin', 'warehouse')
  @UseGuards(RolesGuard)
  checkOut(@Param('id') id: string) {
    return this.inventoryService.checkOut(id);
  }

  @Patch('reservations/:id/return')
  @Roles('admin', 'warehouse')
  @UseGuards(RolesGuard)
  returnItem(@Param('id') id: string) {
    return this.inventoryService.returnItem(id);
  }
}
