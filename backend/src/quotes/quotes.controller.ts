import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('quotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private service: QuotesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  byEvent(@Query('eventId') eventId: string) {
    return this.service.findByEvent(eventId);
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.CLIENT)
  active(@Query('eventId') eventId: string) {
    return this.service.findActive(eventId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.CLIENT)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() dto: CreateQuoteDto) {
    return this.service.create(dto);
  }

  @Patch(':id/approve')
  @Roles(UserRole.CLIENT, UserRole.ADMIN)
  approve(@Param('id') id: string, @Body('clientName') clientName: string) {
    return this.service.approveByClient(id, clientName);
  }
}
