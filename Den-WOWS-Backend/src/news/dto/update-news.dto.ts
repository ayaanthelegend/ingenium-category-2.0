import {IsArray, IsNumber, IsOptional, IsString} from 'class-validator';
import {StockEffect} from "../interfaces/news.interface";

export class UpdateNewsDto {
  @IsString()
  headline: string;

  @IsString()
  desc: string;

  @IsNumber()
  sequence: number;

  @IsOptional()
  @IsArray()
  effects?: StockEffect[];
}
