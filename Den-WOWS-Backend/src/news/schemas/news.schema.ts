import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {StockEffect} from "../interfaces/news.interface";

export type NewsDocument = News & Document;

@Schema({ timestamps: true, collection: "news" })
export class News {
  @Prop()
  headline: string;

  @Prop()
  desc: string

  @Prop({ required: true })
  sequence: number;

  @Prop({ required: true })
  effects: StockEffect[];

  @Prop({ required: true })
  effectAt: number; // time in seconds
}

export const NewsSchema = SchemaFactory.createForClass(News);