// apps/api/src/suppliers/suppliers.controller.ts
import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll(@Query('q') q?: string, @Query('category') category?: string) {
    return this.suppliersService.findAll(q, category);
  }

  @Get('categories')
  getCategories() {
    return this.suppliersService.getCategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Post()
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  create(@Body() body: any) {
    return this.suppliersService.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.suppliersService.update(id, body);
  }

  @Post('purchase-orders')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  createPO(@Body() body: any) {
    return this.suppliersService.createPO(body);
  }

  @Patch('purchase-orders/:id')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  updatePO(@Param('id') id: string, @Body() body: any) {
    return this.suppliersService.updatePO(id, body);
  }

  @Get('purchase-orders/event/:eventId')
  getPOsByEvent(@Param('eventId') eventId: string) {
    return this.suppliersService.getPOsByEvent(eventId);
  }
}
