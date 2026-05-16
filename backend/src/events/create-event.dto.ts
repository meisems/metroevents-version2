import {
  IsString, IsEnum, IsDateString, IsOptional, IsUUID, IsInt, IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, EventType } from '../event.entity';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty()
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  venue?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  venueAddress?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsInt()
  guestCount?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  packageName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  coordinatorId?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUUID()
  designerId?: string;
}
