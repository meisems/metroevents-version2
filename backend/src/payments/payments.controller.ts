import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  byEvent(@Query('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  @Get('overdue')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  overdue() {
    return this.service.getOverdue();
  }

  @Get('due-soon')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  dueSoon(@Query('days') days?: string) {
    return this.service.getDueSoon(days ? +days : 3);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() dto: CreatePaymentDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() dto: Partial<CreatePaymentDto>) {
    return this.service.update(id, dto);
  }

  @Patch(':id/mark-paid')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  markPaid(@Param('id') id: string, @Body('paidDate') paidDate?: string) {
    return this.service.markPaid(id, paidDate);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
