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
    return this.newsModel.create(news)
  }

  async getNews(): Promise<Array<NewsDocument>> {
    return this.newsModel.find().exec()
  }

  async updateNews(id: string, updateNewsDto: Partial<UpdateNewsDto>) {
    return this.newsModel.findByIdAndUpdate(id, updateNewsDto, { new: true }).exec();
  }

  async deleteNews(id: string) {
    return this.newsModel.deleteOne({_id: new Types.ObjectId(id)});
  }
}
