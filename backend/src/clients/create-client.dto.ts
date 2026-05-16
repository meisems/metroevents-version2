import { IsEmail, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CRMStage } from '../client.entity';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  referralSource?: string;

  @ApiPropertyOptional({ enum: CRMStage })
  @IsOptional() @IsEnum(CRMStage)
  stage?: CRMStage;

  @ApiPropertyOptional()
  @IsOptional() @IsDateString()
  ocularDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  internalNotes?: string;
}
