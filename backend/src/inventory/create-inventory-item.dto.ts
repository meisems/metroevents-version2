import {
  IsString, IsEnum, IsInt, IsOptional, IsNumber,
} from 'class-validator';
import { ItemCategory, ItemCondition } from '../inventory.entity';

export class CreateInventoryItemDto {
  @IsString()  sku: string;
  @IsString()  name: string;
  @IsEnum(ItemCategory) category: ItemCategory;
  @IsInt()     totalQuantity: number;
  @IsOptional() @IsString() storageLocation?: string;
  @IsOptional() @IsString() dimensions?: string;
  @IsOptional() @IsNumber() replacementCost?: number;
  @IsOptional() @IsNumber() rentalPrice?: number;
  @IsOptional() @IsEnum(ItemCondition) condition?: ItemCondition;
  @IsOptional() @IsString() notes?: string;
}
