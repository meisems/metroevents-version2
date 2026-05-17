// apps/api/src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingClientAccounts() {
    return this.prisma.clientAccount.findMany({
      where: { accountStatus: 'pending' },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        client: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveClientAccount(accountId: string, adminId: string) {
    return this.prisma.clientAccount.update({
      where: { id: accountId },
      data: {
        accountStatus: 'approved',
        approvedAt: new Date(),
        approvedByUserId: adminId,
      },
    });
  }

  async suspendClientAccount(accountId: string) {
    return this.prisma.clientAccount.update({
      where: { id: accountId },
      data: { accountStatus: 'suspended' },
    });
  }

  async linkClientAccount(accountId: string, clientId: string) {
    return this.prisma.clientAccount.update({
      where: { id: accountId },
      data: { clientId },
    });
  }

  async getSystemStats() {
    const [userCount, clientCount, eventCount, inventoryCount] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.client.count(),
      this.prisma.event.count(),
      this.prisma.inventoryItem.count({ where: { isActive: true } }),
    ]);
    return { userCount, clientCount, eventCount, inventoryCount };
  }
}
