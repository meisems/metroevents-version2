import {
  Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { OrderRequestStatus } from './order-request.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private service: PublicService) {}

  /** Open endpoint — anyone can submit */
  @Post('order-requests')
  submitOrder(@Body() dto: any, @Req() req: any) {
    return this.service.submitOrderRequest(dto, req.ip);
  }

  /** Open endpoint — published reviews for landing page */
  @Get('reviews')
  publishedReviews() {
    return this.service.getPublishedReviews();
  }

  /** Authenticated clients can submit a review */
  @Post('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  submitReview(@Body() dto: any, @Req() req: any) {
    return this.service.submitReview({
      ...dto,
      clientId: req.user.linkedClientId,
    });
  }

  /* ---- Admin-only endpoints ---- */

  @Get('order-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  listOrders(@Query('status') status?: OrderRequestStatus) {
    return this.service.findAllOrders(status);
  }

  @Patch('order-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  updateOrder(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateOrder(id, dto);
  }

  @Get('reviews/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  allReviews() { return this.service.findAllReviews(); }

  @Patch('reviews/:id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  publishReview(
    @Param('id') id: string,
    @Body('published') published: boolean,
    @Req() req: any,
  ) {
    return this.service.setPublished(id, published, req.user.id);
  }
}
