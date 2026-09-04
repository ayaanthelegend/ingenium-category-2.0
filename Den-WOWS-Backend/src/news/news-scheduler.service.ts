import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from './schemas/news.schema';
import { FlagsService } from '../flags/flags.service';
import { Flag } from '../flags/schemas/flag.schema';

// Configurable constants (5 minutes interval, 10 seconds auto-pause window)
export const NEWS_RELEASE_INTERVAL_SECONDS = process.env.NEWS_RELEASE_INTERVAL_SEC
  ? Number(process.env.NEWS_RELEASE_INTERVAL_SEC)
  : 300; // 5 minutes (300 seconds)

export const AUTO_PAUSE_DURATION_MS = process.env.AUTO_PAUSE_DURATION_MS
  ? Number(process.env.AUTO_PAUSE_DURATION_MS)
  : 10000; // 10 seconds

@Injectable()
export class NewsSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NewsSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    @InjectModel(Flag.name) private flagModel: Model<Flag>,
    private readonly flagsService: FlagsService,
  ) {}

  onModuleInit() {
    this.logger.log(`[NewsScheduler] Starting auto-release scheduler (Interval: ${NEWS_RELEASE_INTERVAL_SECONDS}s, Pause Window: ${AUTO_PAUSE_DURATION_MS / 1000}s)`);
    this.timer = setInterval(() => this.checkAndReleaseNextNews(), 3000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async checkAndReleaseNextNews() {
    if (this.isProcessing) return;

    try {
      const flag = await this.flagsService.getFullFlag('global');
      if (!flag) return;

      // Find the next queued news item (sequence 6..20, released: false)
      const nextNews = await this.newsModel
        .findOne({ released: false })
        .sort({ sequence: 1 })
        .exec();

      if (!nextNews) {
        // No queued news items remain
        return;
      }

      if (nextNews.sequence > 20) {
        // Queue finishes at sequence 20
        return;
      }

      // If market is manually paused (value === false) and NOT in auto-pause cycle, do not advance
      if (!flag.value && !flag.isAutoPausing) {
        return;
      }

      const elapsed = flag.elapsedSeconds || 0;
      const lastRelease = flag.lastReleaseElapsedSeconds || 0;
      const timeSinceLastRelease = elapsed - lastRelease;

      if (timeSinceLastRelease >= NEWS_RELEASE_INTERVAL_SECONDS && flag.value) {
        this.isProcessing = true;
        this.logger.log(
          `[NewsScheduler] Target elapsed time reached (${timeSinceLastRelease}s >= ${NEWS_RELEASE_INTERVAL_SECONDS}s). Auto-releasing news #${nextNews.sequence} ("${nextNews.headline}")...`,
        );

        // 1. Auto-pause the event
        await this.flagsService.pause();
        await this.flagModel.findOneAndUpdate(
          { key: 'global' },
          { isAutoPausing: true },
        );
        this.logger.log(`[NewsScheduler] Event auto-paused for ${AUTO_PAUSE_DURATION_MS / 1000}s update window.`);

        // 2. Wait 10 seconds
        await new Promise((res) => setTimeout(res, AUTO_PAUSE_DURATION_MS));

        // 3. Publish queued news item & update last release timestamp
        nextNews.released = true;
        await nextNews.save();

        const currentElapsed = this.flagsService.getElapsedSeconds(flag);
        await this.flagModel.findOneAndUpdate(
          { key: 'global' },
          {
            lastReleaseElapsedSeconds: currentElapsed,
            isAutoPausing: false,
          },
        );

        // 4. Auto-resume the event
        await this.flagsService.start();
        this.logger.log(`[NewsScheduler] News #${nextNews.sequence} published & event auto-resumed!`);
      }
    } catch (error) {
      this.logger.error('[NewsScheduler] Error checking/releasing news:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
