// apps/api/src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    return this.prisma.user.findMany({
      where: { ...(role && { role: role as any }) },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, avatarUrl: true, isActive: true,
        lastLogin: true, createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, avatarUrl: true, isActive: true,
        lastLogin: true, createdAt: true,
      },
    });
  }

  async update(id: string, data: any) {
    const { password, ...rest } = data;
    const updateData: any = { ...rest };
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  async setRole(id: string, role: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role: role as any },
      select: { id: true, name: true, role: true },
    });
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });
  }
}
