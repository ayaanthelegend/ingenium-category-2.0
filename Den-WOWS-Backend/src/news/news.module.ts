import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {News, NewsSchema} from "./schemas/news.schema";
import {NewsController} from "./news.controller";
import {NewsService} from "./news.service";
import {FlagsModule} from "../flags/flags.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]), FlagsModule],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
