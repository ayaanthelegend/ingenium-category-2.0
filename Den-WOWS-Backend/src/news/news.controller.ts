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

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
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
    return seedQueuedNews();
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

