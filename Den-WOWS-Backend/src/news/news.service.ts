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
      released: (news as any).released !== undefined ? (news as any).released : true,
    };
    return this.newsModel.create(newsToCreate);
  }

  async getNews(): Promise<Array<NewsDocument>> {
    return this.newsModel.find().exec();
  }

  async getPublishedNews(): Promise<Array<NewsDocument>> {
    return this.newsModel.find({ released: { $ne: false } }).exec();
  }

  async publishNews(id: string): Promise<NewsDocument | null> {
    return this.newsModel.findByIdAndUpdate(id, { released: true }, { new: true }).exec();
  }

  async updateNews(id: string, updateNewsDto: Partial<UpdateNewsDto>) {
    return this.newsModel.findByIdAndUpdate(id, updateNewsDto, { new: true }).exec();
  }

  async deleteNews(id: string) {
    return this.newsModel.deleteOne({_id: new Types.ObjectId(id)});
  }
}
