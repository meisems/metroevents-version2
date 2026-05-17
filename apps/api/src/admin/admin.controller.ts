// apps/api/src/admin/admin.controller.ts
import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';
import { CurrentUser } from '../auth/decorators/index';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('client-accounts/pending')
  getPendingClientAccounts() {
    return this.adminService.getPendingClientAccounts();
  }

  @Patch('client-accounts/:id/approve')
  approveClientAccount(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adminService.approveClientAccount(id, user.id);
  }

  @Patch('client-accounts/:id/suspend')
  suspendClientAccount(@Param('id') id: string) {
    return this.adminService.suspendClientAccount(id);
  }

  @Patch('client-accounts/:id/link-client')
  linkClientAccount(@Param('id') id: string, @Body('clientId') clientId: string) {
    return this.adminService.linkClientAccount(id, clientId);
  }
}
