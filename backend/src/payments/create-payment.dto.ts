import {
  IsUUID, IsEnum, IsNumber, IsOptional, IsString, IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType, PaymentStatus, PaymentMethod } from '../payment.entity';

export class CreatePaymentDto {
  @ApiProperty() @IsUUID()         eventId: string;
  @ApiProperty({ enum: PaymentType }) @IsEnum(PaymentType)   type: PaymentType;
  @ApiProperty() @IsNumber()        amount: number;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional() @IsEnum(PaymentStatus) status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional() @IsEnum(PaymentMethod) method?: PaymentMethod;

  @ApiPropertyOptional() @IsOptional() @IsString()     referenceNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() paidDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString()     notes?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID()       recordedById?: string;
}
