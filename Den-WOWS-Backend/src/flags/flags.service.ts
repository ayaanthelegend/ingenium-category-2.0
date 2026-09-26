import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flag } from './schemas/flag.schema';

@Injectable()
export class FlagsService {
  constructor(@InjectModel(Flag.name) private flagModel: Model<Flag>) {}

  getElapsedSeconds(flag: any): number {
    if (!flag) return 0;
    const duration = flag.roundDurationSeconds || 0;
    const accumulated = Math.max(0, flag.accumulatedSeconds || 0);
    if (!flag.value) {
      return duration > 0 ? Math.min(accumulated, duration) : accumulated;
    }
    const startTime = flag.startedAt
      ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime())
      : Date.now();
    const currentSegment = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
    const total = accumulated + currentSegment;
    return duration > 0 ? Math.min(total, duration) : total;
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
      await this.flagModel.findOneAndUpdate(
        { key },
        { value: false, accumulatedSeconds: flag.roundDurationSeconds }
      );
      return false;
    }
    return true;
  }

  async start(durationSeconds?: number) {
    const existingFlag = await this.flagModel.findOne({ key: 'global' }).exec();
    let newDuration = existingFlag?.roundDurationSeconds || 300;

    if (durationSeconds !== undefined && durationSeconds !== null && !isNaN(Number(durationSeconds)) && Number(durationSeconds) > 0) {
      newDuration = Number(durationSeconds);
    } else if (newDuration < 60) {
      newDuration = 300;
    }

    const currentElapsed = existingFlag ? this.getElapsedSeconds(existingFlag) : 0;
    let accumulated = existingFlag?.accumulatedSeconds || 0;

    // Reset accumulated time if previous round expired or corrupt
    if (!existingFlag || accumulated < 0 || (newDuration > 0 && currentElapsed >= newDuration)) {
      accumulated = 0;
    }

    const updateData: any = {
      startedAt: Date.now(),
      accumulatedSeconds: accumulated,
      roundDurationSeconds: newDuration,
      value: true,
      isAutoPausing: false,
    };

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
    const duration = flag.roundDurationSeconds || 0;
    let newAccumulated = (flag.accumulatedSeconds || 0) + elapsed;
    if (duration > 0 && newAccumulated >= duration) {
      newAccumulated = duration;
    }

    return this.flagModel.findOneAndUpdate(
      { key: 'global' },
      {
        value: false,
        accumulatedSeconds: newAccumulated,
        isAutoPausing: false,
      },
      { upsert: true, new: true },
    );
  }

  async reset(durationSeconds?: number) {
    const existingFlag = await this.flagModel.findOne({ key: 'global' }).exec();
    let newDuration = existingFlag?.roundDurationSeconds || 300;

    if (durationSeconds !== undefined && durationSeconds !== null && !isNaN(Number(durationSeconds)) && Number(durationSeconds) > 0) {
      newDuration = Number(durationSeconds);
    } else if (newDuration < 60) {
      newDuration = 300;
    }

    const updateData: any = {
      startedAt: Date.now(),
      accumulatedSeconds: 0,
      roundDurationSeconds: newDuration,
      value: false,
      isAutoPausing: false,
    };

    return this.flagModel.findOneAndUpdate(
      { key: 'global' },
      updateData,
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
        value: false,
        startedAt: Date.now(),
        accumulatedSeconds: 0,
        roundDurationSeconds: 300,
      });
      await flag.save();
    }

    let duration = flag.roundDurationSeconds || 0;
    // Heal corrupt tiny duration (e.g. 1s from legacy fallbacks)
    if (duration > 0 && duration < 60) {
      duration = 300;
      flag.roundDurationSeconds = 300;
      await flag.save();
    }

    // Self-heal corrupt accumulatedSeconds if found in DB
    if (duration > 0 && (flag.accumulatedSeconds || 0) > duration) {
      flag.accumulatedSeconds = duration;
      await flag.save();
    }

    const elapsed = this.getElapsedSeconds(flag);

    // If active round has reached duration, freeze state in DB
    if (duration > 0 && elapsed >= duration && flag.value) {
      flag.value = false;
      flag.accumulatedSeconds = duration;
      await flag.save();
    }

    const obj: any = flag.toObject ? flag.toObject() : { ...flag };
    obj.elapsedSeconds = elapsed;
    obj.roundDurationSeconds = duration;
    obj.timeLeft = duration > 0 ? Math.max(0, duration - elapsed) : 0;
    obj.isAutoPausing = Boolean(flag.isAutoPausing);

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
