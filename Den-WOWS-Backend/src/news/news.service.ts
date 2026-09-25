import { Injectable } from '@nestjs/common';
import {News, NewsDocument} from "./schemas/news.schema";
import {Model, Types} from "mongoose";
import {InjectModel} from "@nestjs/mongoose";
import {CreateNewsDto} from "./dto/create-news.dto";
import {UpdateNewsDto} from "./dto/update-news.dto";

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
  ) {}

  async createNews(news: CreateNewsDto): Promise<NewsDocument> {
    const newsToCreate = {
      ...news,
      released: false,
    };
    delete (newsToCreate as any).releasedAt;
    return this.newsModel.create(newsToCreate);
  }

  async getNews(): Promise<Array<NewsDocument>> {
    return this.newsModel.find().exec();
  }

  async getPublishedNews(): Promise<Array<NewsDocument>> {
    return this.newsModel.find({ released: { $ne: false } }).exec();
  }

  async publishNews(id: string): Promise<NewsDocument | null> {
    const existing = await this.newsModel.findById(id).exec();
    if (!existing) return null;
    if (existing.released) {
      return existing;
    }
    existing.released = true;
    existing.releasedAt = new Date();
    return existing.save();
  }

  async updateNews(id: string, updateNewsDto: Partial<UpdateNewsDto>) {
    return this.newsModel.findByIdAndUpdate(id, updateNewsDto, { new: true }).exec();
  }

  async deleteNews(id: string) {
    return this.newsModel.deleteOne({_id: new Types.ObjectId(id)});
  }

  async resetQueueToHeader15(currentElapsed: number): Promise<{ success: boolean; message: string }> {
    await this.newsModel.updateMany({ sequence: { $gt: 15 } }, { released: false }).exec();
    await this.newsModel.updateMany({ sequence: { $lte: 15 } }, { released: true }).exec();

    return {
      success: true,
      message: 'News queue synchronized to Header #15. Next in line: Header #16 (or dummy test headers)!',
    };
  }

  async resetQueueToHeader10(currentElapsed: number): Promise<{ success: boolean; message: string }> {
    return this.resetQueueToHeader15(currentElapsed);
  }

  async resetQueueToHeader5(currentElapsed: number): Promise<{ success: boolean; message: string }> {
    return this.resetQueueToHeader15(currentElapsed);
  }

  async deleteDummyHeaders(): Promise<{ success: boolean; deletedCount: number; message: string }> {
    const res = await this.newsModel.deleteMany({
      $or: [
        { sequence: { $in: [15.1, 15.2] } },
        { headline: { $regex: /\[TEST DUMMY/i } }
      ]
    }).exec();

    return {
      success: true,
      deletedCount: res.deletedCount || 0,
      message: `Deleted ${res.deletedCount || 0} dummy test headers. News queue is now set to start from Header #16!`,
    };
  }
}
