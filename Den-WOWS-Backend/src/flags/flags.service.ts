import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flag } from './schemas/flag.schema';

@Injectable()
export class FlagsService {
  constructor(@InjectModel(Flag.name) private flagModel: Model<Flag>) {}

  private async checkAutoPause(flag: any): Promise<any> {
    if (flag && flag.key === 'global' && flag.value === true) {
      const startTime = flag.startedAt ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime()) : Date.now();
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      if (elapsedSeconds >= 120) {
        flag.value = false;
        flag.accumulatedSeconds = (flag.accumulatedSeconds || 0) + 120;
        await flag.save();
        console.log('[FlagsService] 120s auto-pause triggered. Global flag set to false.');
      }
    }
    return flag;
  }

  async getFlag(key: string): Promise<boolean> {
    let flag = await this.flagModel.findOne({ key }).exec();
    if (!flag) {
      flag = new this.flagModel({
        key,
        value: true,
        startedAt: Date.now(),
        accumulatedSeconds: 0,
      });
      await flag.save();
    }
    flag = await this.checkAutoPause(flag);
    return flag ? flag.value : true;
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
    const startTime = flag && flag.startedAt ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime()) : Date.now();
    const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    return this.flagModel.findOneAndUpdate(
      { key: 'global' },
      {
        value: false,
        $inc: {
          accumulatedSeconds: elapsed,
        },
      },
      { upsert: true, new: true },
    );
  }

  async getFullFlag(key: string): Promise<any> {
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
    flag = await this.checkAutoPause(flag);
    if (!flag) return null;

    const obj: any = flag.toObject ? flag.toObject() : { ...flag };
    const startTime = flag.startedAt ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime()) : Date.now();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    obj.pauseTimeLeft = flag.value ? Math.max(0, 120 - elapsed) : 0;
    return obj;
  }

  async setFlag(key: string, value: boolean): Promise<any> {
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
