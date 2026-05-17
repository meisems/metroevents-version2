// apps/api/src/reviews/reviews.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findAll(featuredOnly?: boolean) {
    return this.prisma.review.findMany({
      where: featuredOnly ? { isFeatured: true } : undefined,
      include: { client: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.review.create({
      data,
      include: { client: { select: { fullName: true } } },
    });
  }

  async toggleFeatured(id: string) {
    const review = await this.prisma.review.findUniqueOrThrow({ where: { id } });
    return this.prisma.review.update({
      where: { id },
      data: { isFeatured: !review.isFeatured },
    });
  }

  async remove(id: string) {
    return this.prisma.review.delete({ where: { id } });
  }
}
