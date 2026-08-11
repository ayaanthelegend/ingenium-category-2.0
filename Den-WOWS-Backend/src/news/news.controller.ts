import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {NewsService} from "./news.service";
import {AdminKeyGuard} from "../auth/admin-key.guard";
import {CreateNewsDto} from "./dto/create-news.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {FlagsService} from "../flags/flags.service";
import {News} from "./schemas/news.schema";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {FeatureFlagGuard, RequireFlag} from "../flags/flag.guard";

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly flagsService: FlagsService,
  ) {}

  @Get('/admin')
  @UseGuards(AdminKeyGuard)
  getNewsAdmin() {
    return this.newsService.getNews();
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  @RequireFlag('global')
  @UseGuards(FeatureFlagGuard)
  async getNews() {
    const allNews = await this.newsService.getNews();
    const flag = await this.flagsService.getFullFlag('global')

    if (flag) {
      const sorted = [...allNews].sort((a, b) => a.sequence - b.sequence);
      const triggered: News[] = [];
      let accumulatedTime = 0;

      const startTime = flag && flag.startedAt ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime()) : Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));

      for (let i = 0; i < sorted.length; i++) {
        accumulatedTime += sorted[i].effectAt;

        if (accumulatedTime <= elapsedSeconds) {
          triggered.push(sorted[i]);
        } else {
          triggered.push(sorted[i]);
          break;
        }
      }

      triggered.forEach(t => (t.effects = []));
      return triggered;
    } else {
      throw new InternalServerErrorException();
    }
  }


  @Get('/time-left')
  @UseGuards(JwtAuthGuard)
  @RequireFlag('global')
  @UseGuards(FeatureFlagGuard)
  async getTimeLeft() {
    const allNews = await this.newsService.getNews();
    const flag = await this.flagsService.getFullFlag('global');

    if (!flag) throw new InternalServerErrorException();

    const sorted = [...allNews].sort((a, b) => a.sequence - b.sequence);
    let accumulatedTime = 0;

    const startTime = flag && flag.startedAt ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime()) : Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTime) / 1000));

    for (let i = 0; i < sorted.length; i++) {
      accumulatedTime += sorted[i].effectAt;

      if (accumulatedTime > elapsedSeconds) {
        // found the "next" item
        const timeLeft = accumulatedTime - elapsedSeconds;
        return { timeLeft };
      }
    }

    // If we've already passed all news items, nothing left
    return { timeLeft: 0 };
  }

  @Post('')
  @UseGuards(AdminKeyGuard)
  createNews(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.createNews(createNewsDto)
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

