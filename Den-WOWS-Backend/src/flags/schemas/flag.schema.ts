import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: "flags"})
export class Flag extends Document {
  @Prop({ required: true, unique: true })
  key: string; // e.g. "registration"

  @Prop({ required: true, default: true })
  value: boolean;

  @Prop({ required: true })
  startedAt: number;

  @Prop()
  accumulatedSeconds: number;
}

export const FlagSchema = SchemaFactory.createForClass(Flag);