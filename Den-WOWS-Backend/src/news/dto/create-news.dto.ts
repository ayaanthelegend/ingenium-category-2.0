import {IsArray, IsNumber, IsString, ValidateNested} from 'class-validator';
import {StockEffect} from "../interfaces/news.interface";
import {Type} from "class-transformer";

export class CreateNewsDto {
  @IsString()
  headline: string;

  @IsString()
  desc: string;

  @IsNumber()
  sequence: number;

  @IsArray()
  effects: StockEffect[];

  @IsNumber()
  effectAt: number
}
