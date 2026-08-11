import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { User, UserSchema } from './users/schemas/user.schema';
import { Stock, StocksSchema } from './stocks/schemas/stocks.schema';
import { News, NewsSchema } from './news/schemas/news.schema';
import { Flag, FlagSchema } from './flags/schemas/flag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Stock.name, schema: StocksSchema },
      { name: News.name, schema: NewsSchema },
      { name: Flag.name, schema: FlagSchema },
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
