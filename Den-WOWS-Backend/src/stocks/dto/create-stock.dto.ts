import {IsNumber, IsString} from 'class-validator';

export class CreateStockDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;
}
