import {
  Injectable, UnauthorizedException, BadRequestException,
  ConflictException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User, UserRole, AccountStatus } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const exists = await this.usersRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const verificationToken = uuid();

    const user = this.usersRepo.create({
      ...dto,
      password: hashedPassword,
      role: dto.role || UserRole.COORDINATOR,
      status: AccountStatus.PENDING,
      emailVerificationToken: verificationToken,
    });

    await this.usersRepo.save(user);
    await this.mailService.sendVerificationEmail(user.email, user.firstName, verificationToken);

    return { message: 'Registration successful. Check your email to verify your account.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findOneBy({ emailVerificationToken: token });
    if (!user) throw new BadRequestException('Invalid or expired verification token');

    user.emailVerified = true;
    user.emailVerificationToken = null;
    // Admin must still approve before status becomes ACTIVE
    await this.usersRepo.save(user);

    return { message: 'Email verified successfully. Your account is pending admin approval.' };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepo.findOneBy({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.emailVerified) throw new UnauthorizedException('Please verify your email first');
    if (user.status === AccountStatus.PENDING)
      throw new UnauthorizedException('Your account is pending admin approval');
    if (user.status === AccountStatus.SUSPENDED)
      throw new UnauthorizedException('Your account has been suspended');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(user: User): Promise<{ access_token: string; user: Partial<User> }> {
    // Update last login
    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
