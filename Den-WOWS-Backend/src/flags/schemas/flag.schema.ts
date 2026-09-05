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

  @Prop({ default: 0 })
  roundDurationSeconds: number;

  @Prop({ default: 0 })
  lastReleaseElapsedSeconds: number;

  @Prop({ default: false })
  isAutoPausing: boolean;

  @Prop({ default: 300 })
  newsReleaseIntervalSeconds: number;

  @Prop({ default: false })
  dummyHeadersSeeded: boolean;
}

export const FlagSchema = SchemaFactory.createForClass(Flag);