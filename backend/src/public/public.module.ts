import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { OrderRequest } from './order-request.entity';
import { Review } from './review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderRequest, Review])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
