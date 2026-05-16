import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AccountStatus, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    const u = await this.repo.findOneBy({ id });
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    await this.repo.update(id, { role });
    return this.findOne(id);
  }

  async setStatus(id: string, status: AccountStatus): Promise<User> {
    await this.repo.update(id, { status });
    return this.findOne(id);
  }

  /** Admin approval for pending registrations */
  async approve(id: string): Promise<User> {
    return this.setStatus(id, AccountStatus.ACTIVE);
  }

  async suspend(id: string): Promise<User> {
    return this.setStatus(id, AccountStatus.SUSPENDED);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }

  findPending() {
    return this.repo.find({ where: { status: AccountStatus.PENDING } });
  }
}
