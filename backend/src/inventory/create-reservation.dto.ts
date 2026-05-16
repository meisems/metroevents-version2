import { IsUUID, IsDateString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { ReservationStatus } from '../inventory.entity';

export class CreateReservationDto {
  @IsUUID()       itemId: string;
  @IsUUID()       eventId: string;
  @IsInt()        quantity: number;
  @IsDateString() reservedDate: string;
  @IsOptional() @IsEnum(ReservationStatus) status?: ReservationStatus;
}
