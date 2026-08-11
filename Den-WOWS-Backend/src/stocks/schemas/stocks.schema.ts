import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StocksDocument = Stock & Document;

@Schema({ timestamps: true, collection: "stocks" })
export class Stock {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true, type: [Number] })
  priceHistory: Array<number>;
}

export const StocksSchema = SchemaFactory.createForClass(Stock);
