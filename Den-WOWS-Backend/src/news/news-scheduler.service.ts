import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from './schemas/news.schema';
import { FlagsService } from '../flags/flags.service';
import { Flag } from '../flags/schemas/flag.schema';
import { Stock, StocksDocument } from '../stocks/schemas/stocks.schema';
import { QUEUED_NEWS_ITEMS, DUMMY_TEST_NEWS_ITEMS } from '../scripts/seed-queued-news';

// Configurable constants
export const DEFAULT_NEWS_RELEASE_INTERVAL_SECONDS = process.env.NEWS_RELEASE_INTERVAL_SEC
  ? Number(process.env.NEWS_RELEASE_INTERVAL_SEC)
  : 300; // 5 minutes default

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
    @InjectModel(Stock.name) private stockModel: Model<StocksDocument>,
    private readonly flagsService: FlagsService,
  ) {}

  async onModuleInit() {
    this.logger.log(`[NewsScheduler] Initializing news scheduler service (manual release mode)...`);
    await this.ensureQueuedNewsSeeded();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async ensureQueuedNewsSeeded() {
    try {
      // 1. Ensure past headers 1..15 are marked released: true
      await this.newsModel.updateMany(
        { sequence: { $lte: 15 }, released: false },
        { released: true },
      ).exec();

      const existingStocks = await this.stockModel.find().exec();

      const buildEffects = (effectsMap: Record<string, any>) => {
        return existingStocks.map((stock) => {
          const stockName = stock.name || '';
          let matchedPrice = -1;

          for (const [ticker, price] of Object.entries(effectsMap)) {
            if (stockName.startsWith(ticker + ' ') || stockName.includes(ticker)) {
              matchedPrice = price;
              break;
            }
          }

          return {
            id: String(stock._id),
            newBuy: matchedPrice,
          };
        });
      };

      // 2. Ensure real queued news items (16..20) are seeded
      for (const item of QUEUED_NEWS_ITEMS) {
        const existing = await this.newsModel.findOne({ sequence: item.sequence }).exec();
        if (!existing) {
          await this.newsModel.create({
            sequence: item.sequence,
            headline: item.headline,
            desc: item.desc,
            effects: buildEffects(item.effectsMap),
            released: false,
          });
          this.logger.log(`[NewsScheduler] Created queued news #${item.sequence} ("${item.headline}").`);
        }
      }

      // 3. Seed test dummy headers if not already seeded
      const flag = await this.flagModel.findOne({ key: 'global' }).exec();
      if (!flag?.dummyHeadersSeeded) {
        for (const item of DUMMY_TEST_NEWS_ITEMS) {
          const existing = await this.newsModel.findOne({ sequence: item.sequence }).exec();
          if (!existing) {
            await this.newsModel.create({
              sequence: item.sequence,
              headline: item.headline,
              desc: item.desc,
              effects: buildEffects(item.effectsMap),
              released: false,
            });
            this.logger.log(`[NewsScheduler] Created test dummy news #${item.sequence} ("${item.headline}").`);
          }
        }
        await this.flagModel.findOneAndUpdate(
          { key: 'global' },
          { dummyHeadersSeeded: true },
        ).exec();
      }
    } catch (err) {
      this.logger.error('[NewsScheduler] Error ensuring queued news are seeded:', err);
    }
  }

  async checkAndReleaseNextNews() {
    if (this.isProcessing) return;

    try {
      const flag = await this.flagsService.getFullFlag('global');
      if (!flag) return;

      // Find the next queued news item (lowest sequence with released: false)
      const nextNews = await this.newsModel
        .findOne({ released: false })
        .sort({ sequence: 1 })
        .exec();

      if (!nextNews) {
        // No queued news items remain
        return;
      }

      // If market is manually paused (value === false) and NOT in auto-pause cycle, do not advance
      if (!flag.value && !flag.isAutoPausing) {
        return;
      }

      const elapsed = flag.elapsedSeconds || 0;
      let lastRelease = flag.lastReleaseElapsedSeconds || 0;

      // Self-correct if lastRelease is somehow ahead of elapsed (e.g. after round restart)
      if (lastRelease > elapsed) {
        lastRelease = 0;
        await this.flagModel.findOneAndUpdate(
          { key: 'global' },
          { lastReleaseElapsedSeconds: 0 },
        );
      }

      const intervalSeconds = (flag.newsReleaseIntervalSeconds && flag.newsReleaseIntervalSeconds > 0)
        ? flag.newsReleaseIntervalSeconds
        : DEFAULT_NEWS_RELEASE_INTERVAL_SECONDS;

      const timeSinceLastRelease = Math.max(0, elapsed - lastRelease);

      if (timeSinceLastRelease >= intervalSeconds && flag.value) {
        this.logger.log(
          `[NewsScheduler] Target elapsed time reached (${timeSinceLastRelease}s >= ${intervalSeconds}s). Auto-releasing news #${nextNews.sequence} ("${nextNews.headline}")...`,
        );
        await this.releaseNewsItem(nextNews);
      }
    } catch (error) {
      this.logger.error('[NewsScheduler] Error in checkAndReleaseNextNews loop:', error);
    }
  }

  async releaseNewsItem(newsItem: NewsDocument): Promise<{ success: boolean; sequence: number; headline: string }> {
    this.isProcessing = true;
    try {
      this.logger.log(`[NewsScheduler] Auto-releasing Headline #${newsItem.sequence}: "${newsItem.headline}"`);

      // 1. Auto-pause the event
      await this.flagsService.pause();
      await this.flagModel.findOneAndUpdate(
        { key: 'global' },
        { isAutoPausing: true },
      );
      this.logger.log(`[NewsScheduler] Market auto-paused for ${AUTO_PAUSE_DURATION_MS / 1000}s update window.`);

      // 2. Wait 10 seconds for update window
      await new Promise((res) => setTimeout(res, AUTO_PAUSE_DURATION_MS));

      // 3. Mark queued news as released
      newsItem.released = true;
      await newsItem.save();

      // Get fresh flag state after pause
      const freshFlag = await this.flagModel.findOne({ key: 'global' }).exec();
      const currentElapsed = freshFlag ? (freshFlag.accumulatedSeconds || 0) : 0;

      await this.flagModel.findOneAndUpdate(
        { key: 'global' },
        {
          lastReleaseElapsedSeconds: currentElapsed,
          isAutoPausing: false,
        },
      );

      // 4. Auto-resume the event
      await this.flagsService.start();
      this.logger.log(`[NewsScheduler] Headline #${newsItem.sequence} published & market auto-resumed!`);

      return {
        success: true,
        sequence: newsItem.sequence,
        headline: newsItem.headline,
      };
    } catch (err) {
      this.logger.error(`[NewsScheduler] Error releasing Headline #${newsItem.sequence}:`, err);
      // Ensure market is not left in a stuck auto-pausing state
      await this.flagModel.findOneAndUpdate(
        { key: 'global' },
        { isAutoPausing: false },
      );
      throw err;
    } finally {
      this.isProcessing = false;
    }
  }

  async releaseNextNewsImmediately(): Promise<{ success: boolean; message: string; news?: any }> {
    if (this.isProcessing) {
      return { success: false, message: 'An update release is already in progress. Please wait.' };
    }

    const nextNews = await this.newsModel
      .findOne({ released: false })
      .sort({ sequence: 1 })
      .exec();

    if (!nextNews) {
      return { success: false, message: 'No queued news items remaining to release.' };
    }

    const res = await this.releaseNewsItem(nextNews);
    return {
      success: true,
      message: `Released Headline #${res.sequence}: "${res.headline}" successfully!`,
      news: nextNews,
    };
  }
}
