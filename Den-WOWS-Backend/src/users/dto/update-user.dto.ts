import {IsNotEmpty, IsNumber, IsString, MinLength} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  balance: number
}
