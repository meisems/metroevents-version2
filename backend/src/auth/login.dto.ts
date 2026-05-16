import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@metroevents.ph' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
