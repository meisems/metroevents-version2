import {
  IsUUID, IsOptional, IsNumber, IsEnum, IsString, IsBoolean,
  IsDateString, IsArray, ValidateNested, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, LineItemUnit } from '../quote.entity';

export class CreateLineItemDto {
  @IsString()  category: string;
  @IsString()  itemName: string;
  @IsInt()     quantity: number;
  @IsEnum(LineItemUnit) unit: LineItemUnit;
  @IsNumber()  unitPrice: number;
  @IsOptional() @IsString() notes?: string;
}

export class CreateQuoteDto {
  @ApiProperty()
  @IsUUID()
  eventId: string;

  @ApiPropertyOptional({ enum: DiscountType })
  @IsOptional() @IsEnum(DiscountType)
  discountType?: DiscountType;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  discountValue?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  discountReason?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  taxPercent?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  downpaymentAmount?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  downpaymentDueDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  balanceDueDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  inclusions?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  exclusions?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ type: [CreateLineItemDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  lineItems?: CreateLineItemDto[];
}
