import {IsNotEmpty, IsNumber, IsString, MinLength} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  balance: number
}
