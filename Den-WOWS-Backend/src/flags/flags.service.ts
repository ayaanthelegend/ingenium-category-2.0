import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flag } from './schemas/flag.schema';

@Injectable()
export class FlagsService {
  constructor(@InjectModel(Flag.name) private flagModel: Model<Flag>) {}

  async getFlag(key: string): Promise<boolean> {
    const flag = await this.flagModel.findOne({ key }).exec();
    if (!flag) {
      const created = new this.flagModel({
        key,
        value: true,
        startedAt: Date.now(),
        accumulatedSeconds: 0,
      });
      await created.save();
      return true;
    }
    return flag.value;
  }

  async start() {
    return this.flagModel.findOneAndUpdate(
      { key: 'global' },
      { startedAt: Date.now(), value: true },
      { upsert: true, new: true },
    );
  }

  async pause() {
    const flag = await this.flagModel.findOne({ key: 'global' }).exec();
    const startTime = flag && flag.startedAt ? flag.startedAt : Date.now();
    return this.flagModel.findOneAndUpdate(
      { key: 'global' },
      {
        value: false,
        $inc: {
          accumulatedSeconds: Number(
            ((Date.now() - startTime) / 1000).toFixed(0)
          ),
        },
      },
      { upsert: true, new: true },
    );
  }

  async getFullFlag(key: string): Promise<Flag | null> {
    let flag = await this.flagModel.findOne({ key }).exec();
    if (flag && !flag.startedAt) {
      flag.startedAt = Date.now();
      await flag.save();
    }
    if (!flag) {
      flag = new this.flagModel({
        key,
        value: true,
        startedAt: Date.now(),
        accumulatedSeconds: 0,
      });
      await flag.save();
    }
    return flag;
  }

  async setFlag(key: string, value: boolean): Promise<Flag> {
    return this.flagModel.findOneAndUpdate(
      { key },
      { value, startedAt: Date.now() },
      { upsert: true, new: true },
    );
  }

  async getAllFlags(): Promise<Flag[]> {
    return this.flagModel.find().exec();
  }
}
