import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flag } from './schemas/flag.schema';

@Injectable()
export class FlagsService {
  constructor(@InjectModel(Flag.name) private flagModel: Model<Flag>) {}

  getElapsedSeconds(flag: any): number {
    if (!flag) return 0;
    const accumulated = flag.accumulatedSeconds || 0;
    if (!flag.value) return accumulated;
    const startTime = flag.startedAt
      ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime())
      : Date.now();
    const currentSegment = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    return accumulated + currentSegment;
  }

  async getFlag(key: string): Promise<boolean> {
    let flag = await this.flagModel.findOne({ key }).exec();
    if (!flag) {
      flag = new this.flagModel({
        key,
        value: true,
        startedAt: Date.now(),
        accumulatedSeconds: 0,
        roundDurationSeconds: 0,
      });
      await flag.save();
    }
    if (!flag.value) return false;
    const elapsed = this.getElapsedSeconds(flag);
    if (flag.roundDurationSeconds > 0 && elapsed >= flag.roundDurationSeconds) {
      return false;
    }
    return true;
  }

  async start(durationSeconds?: number) {
    const existingFlag = await this.flagModel.findOne({ key: 'global' }).exec();
    const updateData: any = {
      startedAt: Date.now(),
      value: true,
    };

    if (durationSeconds !== undefined && durationSeconds !== null && !isNaN(Number(durationSeconds))) {
      updateData.roundDurationSeconds = Number(durationSeconds);
    }

    const duration = updateData.roundDurationSeconds ?? existingFlag?.roundDurationSeconds ?? 0;
    const currentElapsed = existingFlag ? this.getElapsedSeconds(existingFlag) : 0;

    if (!existingFlag || existingFlag.accumulatedSeconds === undefined || existingFlag.accumulatedSeconds === null) {
      updateData.accumulatedSeconds = 0;
      updateData.lastReleaseElapsedSeconds = 0;
    } else if (duration > 0 && currentElapsed >= duration) {
      updateData.accumulatedSeconds = 0;
      updateData.lastReleaseElapsedSeconds = 0;
    }

    updateData.isAutoPausing = false;

    return this.flagModel.findOneAndUpdate(
      { key: 'global' },
      updateData,
      { upsert: true, new: true },
    );
  }

  async pause() {
    const flag = await this.flagModel.findOne({ key: 'global' }).exec();
    if (!flag || !flag.value) {
      return flag;
    }
    const startTime = flag.startedAt
      ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime())
      : Date.now();
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
        roundDurationSeconds: 0,
      });
      await flag.save();
    }

    const obj: any = flag.toObject ? flag.toObject() : { ...flag };
    const elapsed = this.getElapsedSeconds(flag);
    const duration = flag.roundDurationSeconds || 0;
    const interval = (flag.newsReleaseIntervalSeconds && flag.newsReleaseIntervalSeconds > 0)
      ? flag.newsReleaseIntervalSeconds
      : (process.env.NEWS_RELEASE_INTERVAL_SEC ? Number(process.env.NEWS_RELEASE_INTERVAL_SEC) : 300);
    const lastRelease = flag.lastReleaseElapsedSeconds || 0;
    const timeSinceLast = Math.max(0, elapsed - lastRelease);

    obj.elapsedSeconds = elapsed;
    obj.roundDurationSeconds = duration;
    obj.timeLeft = duration > 0 ? Math.max(0, duration - elapsed) : 0;
    obj.isAutoPausing = Boolean(flag.isAutoPausing);
    obj.newsReleaseIntervalSeconds = interval;
    obj.lastReleaseElapsedSeconds = lastRelease;
    obj.nextReleaseInSeconds = Math.max(0, interval - timeSinceLast);

    if (flag.isAutoPausing) {
      obj.autoPauseMessage = 'Market paused — new update incoming';
    }
    if (duration > 0 && elapsed >= duration) {
      obj.value = false;
    }
    return obj;
  }

  async setIntervalSeconds(seconds: number): Promise<any> {
    const validSec = Math.max(5, Number(seconds) || 300);
    return this.flagModel.findOneAndUpdate(
      { key: 'global' },
      { newsReleaseIntervalSeconds: validSec },
      { upsert: true, new: true },
    );
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
