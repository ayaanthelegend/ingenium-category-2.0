import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {StockUser} from "../../stocks/interfaces/stocks.interface";

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: "users" })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string; // hashed

  @Prop({ required: true, type: Number })
  balance: number;

  @Prop()
  stocksOwned: StockUser[];
}

export const UserSchema = SchemaFactory.createForClass(User);
