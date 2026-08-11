import {IsString, ValidateNested} from "class-validator";

export class UpdateStockDto {
  @IsString()
  name: string;

  @ValidateNested()
  price: number;
}