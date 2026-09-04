import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { News, NewsSchema } from "./schemas/news.schema";
import { NewsController } from "./news.controller";
import { NewsService } from "./news.service";
import { NewsSchedulerService } from "./news-scheduler.service";
import { FlagsModule } from "../flags/flags.module";
import { Flag, FlagSchema } from "../flags/schemas/flag.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema },
      { name: Flag.name, schema: FlagSchema },
    ]),
    FlagsModule,
  ],
  controllers: [NewsController],
  providers: [NewsService, NewsSchedulerService],
  exports: [NewsService, NewsSchedulerService],
})
export class NewsModule {}
