import {IsNumber, IsString, Min} from 'class-validator';

export class BuySellStockDto {
  @IsNumber()
  @Min(1)
  amount: number;
}
