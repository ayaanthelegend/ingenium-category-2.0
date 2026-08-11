import {IsNumber, IsString} from 'class-validator';

export class UpdateNewsDto {
  @IsString()
  headline: string;

  @IsString()
  desc: string;

  @IsNumber()
  sequence: number;

  @IsNumber()
  effectAt: number
}
