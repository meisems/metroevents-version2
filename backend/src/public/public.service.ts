import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRequest, OrderRequestStatus } from './order-request.entity';
import { Review } from './review.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(OrderRequest) private orderRepo: Repository<OrderRequest>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {}

  /** Public: submit an order request from the landing page */
  submitOrderRequest(dto: any, ip?: string): Promise<OrderRequest> {
    return this.orderRepo.save(this.orderRepo.create({ ...dto, ipAddress: ip }));
  }

  /** Admin: list all order requests */
  findAllOrders(status?: OrderRequestStatus) {
    return this.orderRepo.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
    });
  }

  /** Admin: update order request (status, notes, etc.) */
  async updateOrder(id: string, dto: any): Promise<OrderRequest> {
    await this.orderRepo.update(id, dto);
    return this.orderRepo.findOneBy({ id });
  }

  /** Public: get published reviews (for landing page) */
  getPublishedReviews(): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { isPublished: true },
      order: { createdAt: 'DESC' },
    });
  }

  /** Client: submit a review */
  submitReview(dto: any): Promise<Review> {
    return this.reviewRepo.save(this.reviewRepo.create(dto));
  }

  /** Admin: publish / unpublish a review */
  async setPublished(id: string, published: boolean, adminId: string): Promise<Review> {
    await this.reviewRepo.update(id, { isPublished: published, publishedById: adminId });
    return this.reviewRepo.findOneBy({ id });
  }

  /** Admin: list all reviews */
  findAllReviews() {
    return this.reviewRepo.find({ order: { createdAt: 'DESC' } });
  }
}
