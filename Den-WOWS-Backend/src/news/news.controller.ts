import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {NewsService} from "./news.service";
import {AdminKeyGuard} from "../auth/admin-key.guard";
import {CreateNewsDto} from "./dto/create-news.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {News} from "./schemas/news.schema";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {seedQueuedNews} from "../scripts/seed-queued-news";

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Flag } from '../flags/schemas/flag.schema';
import { FlagsService } from '../flags/flags.service';
import { NewsSchedulerService } from './news-scheduler.service';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly flagsService: FlagsService,
    private readonly newsSchedulerService: NewsSchedulerService,
    @InjectModel(Flag.name) private flagModel: Model<Flag>,
  ) {}

  @Get('/admin')
  @UseGuards(AdminKeyGuard)
  getNewsAdmin() {
    return this.newsService.getNews();
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getNews() {
    const allNews = await this.newsService.getPublishedNews();
    const sorted = [...allNews].sort((a, b) => a.sequence - b.sequence);
    return sorted.map((t) => {
      const obj = t.toObject ? t.toObject() : { ...t };
      obj.effects = [];
      return obj;
    });
  }

  @Post('')
  @UseGuards(AdminKeyGuard)
  createNews(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.createNews(createNewsDto)
  }

  @Post('seed-queued')
  @UseGuards(AdminKeyGuard)
  async seedQueued() {
    await this.newsSchedulerService.ensureQueuedNewsSeeded();
    return { success: true, message: 'Queued news verified and seeded.' };
  }

  @Post(':id/release')
  @UseGuards(AdminKeyGuard)
  async releaseNewsItem(@Param('id') id: string) {
    const news = await this.newsService.publishNews(id);
    if (!news) {
      return { success: false, message: 'News item not found.' };
    }
    return {
      success: true,
      message: `Released Headline #${news.sequence}: "${news.headline}" successfully!`,
      news,
    };
  }

  @Post('reset-queue')
  @UseGuards(AdminKeyGuard)
  async resetQueue() {
    const flag = await this.flagsService.getFullFlag('global');
    const currentElapsed = flag ? (flag.elapsedSeconds || 0) : 0;

    await this.flagModel.findOneAndUpdate(
      { key: 'global' },
      {
        lastReleaseElapsedSeconds: currentElapsed,
        isAutoPausing: false,
      },
      { upsert: true }
    );

    return this.newsService.resetQueueToHeader15(currentElapsed);
  }

  @Delete('dummy-headers')
  @UseGuards(AdminKeyGuard)
  deleteDummyHeaders() {
    return this.newsService.deleteDummyHeaders();
  }

  @Patch(':id')
  @UseGuards(AdminKeyGuard)
  updateNews(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.updateNews(id, updateNewsDto)
  }

  @Delete(':id')
  @UseGuards(AdminKeyGuard)
  deleteNews(@Param('id') id: string) {
    return this.newsService.deleteNews(id)
  }
}

