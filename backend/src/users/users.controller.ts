import {
  Controller, Get, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('pending')
  pending() { return this.service.findPending(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.service.updateRole(id, role);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) { return this.service.approve(id); }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string) { return this.service.suspend(id); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
