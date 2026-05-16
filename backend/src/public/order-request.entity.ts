
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum OrderRequestStatus {
  NEW       = 'new',        // just submitted from the landing page
  CONTACTED = 'contacted',  // team has reached out
  CONVERTED = 'converted',  // became a real CRM client
  DECLINED  = 'declined',   // team chose not to pursue
}

export enum PackagePreference {
  SILVER   = 'silver',
  GOLD     = 'gold',
  PLATINUM = 'platinum',
  CUSTOM   = 'custom',
}

@Entity('order_requests')
export class OrderRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Contact info ──────────────────────────────────────────
  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  // ── Event intent ──────────────────────────────────────────
  @Column({ type: 'date' })
  eventDate: string;

  @Column({ nullable: true, type: 'int' })
  guestCount: number;

  @Column({
    type: 'enum',
    enum: PackagePreference,
    default: PackagePreference.GOLD,
  })
  packagePreference: PackagePreference;

  @Column({ nullable: true })
  eventType: string;        // wedding / debut / birthday / corporate / etc.

  @Column({ type: 'text', nullable: true })
  message: string;

  // ── Internal tracking ─────────────────────────────────────
  @Column({
    type: 'enum',
    enum: OrderRequestStatus,
    default: OrderRequestStatus.NEW,
  })
  status: OrderRequestStatus;

  @Column({ nullable: true })
  handledById: string;      // staff user who picked this up

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ nullable: true })
  convertedClientId: string; // if converted → points to Client entity

  @Column({ nullable: true })
  contactedAt: Date;

  // ── Metadata ──────────────────────────────────────────────
  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  referrer: string;         // HTTP Referer header, useful for ad attribution

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
</parameter>

<creaoArtifact identifier="review-entity" type="application/code" language="typescript" title="public/review.entity.ts" path="files/metro-events-v2/backend/src/modules/public/review.entity.ts">
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum ReviewStatus {
  PENDING  = 'pending',   // awaiting admin approval before showing on landing page
  APPROVED = 'approved',  // visible on public testimonials section
  REJECTED = 'rejected',  // spam / inappropriate
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Reviewer identity ─────────────────────────────────────
  @Column()
  fullName: string;

  @Column({ nullable: true })
  eventType: string;   // wedding / debut / birthday / corporate / other

  // ── Optional link to internal records ────────────────────
  @Column({ nullable: true })
  clientId: string;    // if submitted through the client portal

  @Column({ nullable: true })
  eventId: string;     // specific event this review is about

  // ── Ratings (1–5, stored as decimal for halves) ───────────
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5 })
  ratingOverall: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5 })
  ratingDesign: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5 })
  ratingCoordination: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5 })
  ratingOnTime: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5 })
  ratingCrew: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 5 })
  ratingValue: number;

  // ── Content ───────────────────────────────────────────────
  @Column({ type: 'text' })
  testimonial: string;

  @Column({ default: true })
  recommend: boolean;

  // ── Moderation ────────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ nullable: true })
  approvedById: string;   // admin who approved

  @Column({ nullable: true })
  approvedAt: Date;

  // ── Landing page display ──────────────────────────────────
  @Column({ default: false })
  featuredOnLanding: boolean;  // admin can pin specific reviews to the homepage

  @Column({ default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ── Computed helper ───────────────────────────────────────
  get averageRating(): number {
    const sum =
      Number(this.ratingOverall) +
      Number(this.ratingDesign) +
      Number(this.ratingCoordination) +
      Number(this.ratingOnTime) +
      Number(this.ratingCrew) +
      Number(this.ratingValue);
    return parseFloat((sum / 6).toFixed(2));
  }
}
</parameter>

<creaoArtifact identifier="order-request-dto" type="application/code" language="typescript" title="public/dto/create-order-request.dto.ts" path="files/metro-events-v2/backend/src/modules/public/dto/create-order-request.dto.ts">
import {
  IsString, IsEmail, IsNotEmpty, IsOptional,
  IsInt, Min, IsEnum, IsDateString, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PackagePreference } from '../order-request.entity';

export class CreateOrderRequestDto {
  @ApiProperty({ example: 'Maria Santos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ example: 'maria@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+63 912 345 6789' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @ApiProperty({ example: '2025-12-15', description: 'Target event date (ISO 8601)' })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsInt()
  @Min(1)
  guestCount?: number;

  @ApiProperty({ enum: PackagePreference, example: PackagePreference.GOLD })
  @IsEnum(PackagePreference)
  packagePreference: PackagePreference;

  @ApiPropertyOptional({ example: 'wedding' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  eventType?: string;

  @ApiPropertyOptional({ example: 'We are looking for a garden wedding setup with fairy lights.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

// ── Admin-only update DTO ──────────────────────────────────────────────────────
import { IsIn } from 'class-validator';
import { OrderRequestStatus } from '../order-request.entity';

export class UpdateOrderRequestDto {
  @ApiPropertyOptional({ enum: OrderRequestStatus })
  @IsOptional()
  @IsEnum(OrderRequestStatus)
  status?: OrderRequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;

  @ApiPropertyOptional({ description: 'UUID of the Client created from this inquiry' })
  @IsOptional()
  @IsString()
  convertedClientId?: string;
}
</parameter>

<creaoArtifact identifier="review-dto" type="application/code" language="typescript" title="public/dto/create-review.dto.ts" path="files/metro-events-v2/backend/src/modules/public/dto/create-review.dto.ts">
import {
  IsString, IsNotEmpty, IsOptional, IsBoolean,
  IsNumber, Min, Max, MaxLength, MinLength, IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RatingsDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  Overall: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  Design: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  Coordination: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  'On-Time': number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  Crew: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  Value: number;
}

export class CreateReviewDto {
  @ApiProperty({ example: 'Maria Santos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName: string;

  @ApiPropertyOptional({ example: 'wedding' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  eventType?: string;

  @ApiPropertyOptional({ description: 'Client UUID (if submitted from portal)' })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({ description: 'Event UUID (if submitted from portal)' })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiProperty({ type: RatingsDto })
  ratings: RatingsDto;

  @ApiProperty({ example: 'Ang ganda ng debut ni Bea! Highly recommend Metro Events.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(3000)
  testimonial: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  recommend?: boolean;
}

// ── Admin moderation DTO ──────────────────────────────────────────────────────
import { IsEnum } from 'class-validator';
import { ReviewStatus } from '../review.entity';

export class ModerateReviewDto {
  @ApiProperty({ enum: ReviewStatus })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featuredOnLanding?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  displayOrder?: number;
}
</parameter>

<creaoArtifact identifier="public-service" type="application/code" language="typescript" title="public/public.service.ts" path="files/metro-events-v2/backend/src/modules/public/public.service.ts">
import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { OrderRequest, OrderRequestStatus } from './order-request.entity';
import { Review, ReviewStatus } from './review.entity';
import { CreateOrderRequestDto, UpdateOrderRequestDto } from './dto/create-order-request.dto';
import { CreateReviewDto, ModerateReviewDto } from './dto/create-review.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(OrderRequest)
    private orderRepo: Repository<OrderRequest>,

    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,

    private mailService: MailService,
  ) {}

  // ═══════════════════════════════════════════════════════════
  //  ORDER REQUESTS
  // ═══════════════════════════════════════════════════════════

  async createOrderRequest(
    dto: CreateOrderRequestDto,
    meta: { ipAddress?: string; referrer?: string },
  ): Promise<OrderRequest> {
    const request = this.orderRepo.create({
      ...dto,
      ipAddress: meta.ipAddress,
      referrer: meta.referrer,
      status: OrderRequestStatus.NEW,
    });

    const saved = await this.orderRepo.save(request);

    // Fire-and-forget: notify client + internal team
    await Promise.allSettled([
      this.mailService.sendOrderRequestAutoReply(
        dto.email,
        dto.fullName,
        dto.eventDate,
        dto.packagePreference,
      ),
      this.mailService.notifyNewOrderRequest(saved),
    ]);

    return saved;
  }

  async findAllOrderRequests(filters: {
    status?: OrderRequestStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 20 } = filters;

    const qb = this.orderRepo.createQueryBuilder('req');

    if (status) qb.andWhere('req.status = :status', { status });

    if (search) {
      qb.andWhere(
        '(req.fullName ILIKE :search OR req.email ILIKE :search OR req.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('req.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneOrderRequest(id: string): Promise<OrderRequest> {
    const req = await this.orderRepo.findOneBy({ id });
    if (!req) throw new NotFoundException('Order request not found');
    return req;
  }

  async updateOrderRequest(id: string, dto: UpdateOrderRequestDto, userId: string): Promise<OrderRequest> {
    const req = await this.findOneOrderRequest(id);

    if (dto.status === OrderRequestStatus.CONTACTED && !req.contactedAt) {
      req.contactedAt = new Date();
    }

    req.handledById = userId;
    Object.assign(req, dto);

    return this.orderRepo.save(req);
  }

  /** Summary counts for the admin dashboard widget */
  async getOrderRequestStats() {
    const counts = await Promise.all(
      Object.values(OrderRequestStatus).map(async (status) => ({
        status,
        count: await this.orderRepo.countBy({ status }),
      })),
    );
    return counts.reduce<Record<string, number>>((acc, { status, count }) => {
      acc[status] = count;
      return acc;
    }, {});
  }

  // ═══════════════════════════════════════════════════════════
  //  REVIEWS
  // ═══════════════════════════════════════════════════════════

  async createReview(dto: CreateReviewDto): Promise<{ message: string }> {
    const { ratings, ...rest } = dto;

    if (Object.values(ratings).some((v) => v < 1 || v > 5)) {
      throw new BadRequestException('All ratings must be between 1 and 5');
    }

    const review = this.reviewRepo.create({
      ...rest,
      ratingOverall:      ratings['Overall'],
      ratingDesign:       ratings['Design'],
      ratingCoordination: ratings['Coordination'],
      ratingOnTime:       ratings['On-Time'],
      ratingCrew:         ratings['Crew'],
      ratingValue:        ratings['Value'],
      status: ReviewStatus.PENDING,   // always needs admin approval first
    });

    await this.reviewRepo.save(review);

    return {
      message:
        'Thank you for your review! It will appear on our website once approved by our team.',
    };
  }

  /** Public endpoint — only approved reviews, used by the landing page */
  async getApprovedReviews(featured?: boolean) {
    const where: FindManyOptions<Review>['where'] = { status: ReviewStatus.APPROVED };
    if (featured) (where as any).featuredOnLanding = true;

    return this.reviewRepo.find({
      where,
      order: { displayOrder: 'ASC', approvedAt: 'DESC' },
    });
  }

  /** Public average rating summary (used in hero/stats section) */
  async getRatingSummary() {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .where('r.status = :status', { status: ReviewStatus.APPROVED })
      .select([
        'AVG(r.ratingOverall)      AS overall',
        'AVG(r.ratingDesign)       AS design',
        'AVG(r.ratingCoordination) AS coordination',
        'AVG(r.ratingOnTime)       AS on_time',
        'AVG(r.ratingCrew)         AS crew',
        'AVG(r.ratingValue)        AS value',
        'COUNT(*)                  AS total',
      ])
      .getRawOne();

    return {
      overall:       parseFloat(Number(result.overall ?? 5).toFixed(1)),
      design:        parseFloat(Number(result.design ?? 5).toFixed(1)),
      coordination:  parseFloat(Number(result.coordination ?? 5).toFixed(1)),
      onTime:        parseFloat(Number(result.on_time ?? 5).toFixed(1)),
      crew:          parseFloat(Number(result.crew ?? 5).toFixed(1)),
      value:         parseFloat(Number(result.value ?? 5).toFixed(1)),
      totalReviews:  parseInt(result.total ?? '0', 10),
    };
  }

  // ── Admin: list all reviews (any status) ──────────────────────────────────
  async findAllReviews(status?: ReviewStatus) {
    return this.reviewRepo.find({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOneReview(id: string): Promise<Review> {
    const review = await this.reviewRepo.findOneBy({ id });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  // ── Admin: approve / reject / feature ────────────────────────────────────
  async moderateReview(id: string, dto: ModerateReviewDto, adminId: string): Promise<Review> {
    const review = await this.findOneReview(id);

    Object.assign(review, dto);

    if (dto.status === ReviewStatus.APPROVED && !review.approvedAt) {
      review.approvedById = adminId;
      review.approvedAt = new Date();
    }

    return this.reviewRepo.save(review);
  }

  async deleteReview(id: string): Promise<void> {
    const review = await this.findOneReview(id);
    await this.reviewRepo.remove(review);
  }
}
</parameter>

<creaoArtifact identifier="public-controller" type="application/code" language="typescript" title="public/public.controller.ts" path="files/metro-events-v2/backend/src/modules/public/public.controller.ts">
import {
  Controller, Post, Get, Patch, Delete, Body, Param, Query,
  Request, UseGuards, HttpCode, HttpStatus, Ip, Headers,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiBearerAuth,
  ApiQuery, ApiResponse,
} from '@nestjs/swagger';
import { PublicService } from './public.service';
import { CreateOrderRequestDto, UpdateOrderRequestDto } from './dto/create-order-request.dto';
import { CreateReviewDto, ModerateReviewDto } from './dto/create-review.dto';
import { OrderRequestStatus } from './order-request.entity';
import { ReviewStatus } from './review.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

// ═══════════════════════════════════════════════════════════════════════════════
//  PUBLIC CONTROLLER  (/api/v1/public)
//  — No auth required for POST endpoints (anyone can submit a form)
//  — Admin auth required for management endpoints
// ═══════════════════════════════════════════════════════════════════════════════
@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  // ───────────────────────────────────────────────────────────
  //  LANDING PAGE DATA
  // ───────────────────────────────────────────────────────────

  @Get('reviews')
  @ApiOperation({ summary: 'Get approved reviews for the public landing page' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  getApprovedReviews(@Query('featured') featured?: string) {
    return this.service.getApprovedReviews(featured === 'true');
  }

  @Get('reviews/summary')
  @ApiOperation({ summary: 'Get average rating summary (all categories)' })
  getRatingSummary() {
    return this.service.getRatingSummary();
  }

  // ───────────────────────────────────────────────────────────
  //  ORDER REQUESTS (public form submissions)
  // ───────────────────────────────────────────────────────────

  @Post('order-request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a booking inquiry from the landing page',
    description:
      'No authentication required. Sends auto-reply email to the client and alerts the Metro Events team.',
  })
  @ApiResponse({ status: 201, description: 'Inquiry submitted successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  submitOrderRequest(
    @Body() dto: CreateOrderRequestDto,
    @Ip() ip: string,
    @Headers('referer') referrer: string,
  ) {
    return this.service.createOrderRequest(dto, { ipAddress: ip, referrer });
  }

  // ───────────────────────────────────────────────────────────
  //  REVIEWS (public submission)
  // ───────────────────────────────────────────────────────────

  @Post('reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a public review / testimonial',
    description:
      'No auth required. Review goes into PENDING status until an admin approves it.',
  })
  submitReview(@Body() dto: CreateReviewDto) {
    return this.service.createReview(dto);
  }

  // ───────────────────────────────────────────────────────────
  //  ADMIN — ORDER REQUESTS
  // ───────────────────────────────────────────────────────────

  @Get('admin/order-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all order request inquiries' })
  @ApiQuery({ name: 'status',  required: false, enum: OrderRequestStatus })
  @ApiQuery({ name: 'search',  required: false })
  @ApiQuery({ name: 'page',    required: false, type: Number })
  @ApiQuery({ name: 'limit',   required: false, type: Number })
  findAllOrderRequests(
    @Query('status')  status?: OrderRequestStatus,
    @Query('search')  search?: string,
    @Query('page')    page?: string,
    @Query('limit')   limit?: string,
  ) {
    return this.service.findAllOrderRequests({
      status,
      search,
      page:  page  ? parseInt(page,  10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('admin/order-requests/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Order request counts by status' })
  getOrderRequestStats() {
    return this.service.getOrderRequestStats();
  }

  @Get('admin/order-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiBearerAuth()
  findOneOrderRequest(@Param('id') id: string) {
    return this.service.findOneOrderRequest(id);
  }

  @Patch('admin/order-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update status / notes of an order request' })
  updateOrderRequest(
    @Param('id')    id: string,
    @Body()         dto: UpdateOrderRequestDto,
    @Request()      req,
  ) {
    return this.service.updateOrderRequest(id, dto, req.user.userId);
  }

  // ───────────────────────────────────────────────────────────
  //  ADMIN — REVIEWS MODERATION
  // ───────────────────────────────────────────────────────────

  @Get('admin/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] List all reviews (any moderation status)' })
  @ApiQuery({ name: 'status', required: false, enum: ReviewStatus })
  findAllReviews(@Query('status') status?: ReviewStatus) {
    return this.service.findAllReviews(status);
  }

  @Get('admin/reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  findOneReview(@Param('id') id: string) {
    return this.service.findOneReview(id);
  }

  @Patch('admin/reviews/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Admin] Approve, reject, or feature a review',
    description: 'Sets status to approved/rejected and optionally pins the review to the landing page.',
  })
  moderateReview(
    @Param('id')  id: string,
    @Body()       dto: ModerateReviewDto,
    @Request()    req,
  ) {
    return this.service.moderateReview(id, dto, req.user.userId);
  }

  @Delete('admin/reviews/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[Admin] Permanently delete a review' })
  deleteReview(@Param('id') id: string) {
    return this.service.deleteReview(id);
  }
}
</parameter>

<creaoArtifact identifier="public-module" type="application/code" language="typescript" title="public/public.module.ts" path="files/metro-events-v2/backend/src/modules/public/public.module.ts">
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { OrderRequest } from './order-request.entity';
import { Review } from './review.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderRequest, Review]),
    MailModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
</parameter>

Now the complete mail service — every email template Metro Events needs: