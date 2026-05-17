// apps/api/src/payments/payments.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.paymentsService.findByEvent(eventId);
  }

  @Get('overdue')
  getOverdue() {
    return this.paymentsService.getOverdue();
  }

  @Post()
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  create(@Body() body: any) {
    return this.paymentsService.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.paymentsService.update(id, body);
  }

  @Patch(':id/mark-paid')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  markPaid(
    @Param('id') id: string,
    @Body() body: { method?: string; referenceNumber?: string },
  ) {
    return this.paymentsService.markPaid(id, body.method, body.referenceNumber);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
