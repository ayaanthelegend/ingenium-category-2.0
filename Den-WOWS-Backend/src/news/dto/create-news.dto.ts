import {IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
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

  @IsOptional()
  @IsBoolean()
  released?: boolean;
}
