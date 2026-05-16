import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CRMStage } from './client.entity';

@ApiTags('clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clients')
export class ClientsController {
  constructor(private service: ClientsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'stage', enum: CRMStage, required: false })
  findAll(@Query('search') search?: string, @Query('stage') stage?: CRMStage) {
    return this.service.findAll(search, stage);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  create(@Body() dto: CreateClientDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/advance-stage')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  advanceStage(@Param('id') id: string) {
    return this.service.advanceStage(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
