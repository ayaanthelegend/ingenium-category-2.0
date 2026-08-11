import { Module } from '@nestjs/common';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "../users/schemas/user.schema";
import {Stock, StocksSchema} from "./schemas/stocks.schema";
import {FlagsModule} from "../flags/flags.module";
import {NewsModule} from "../news/news.module";
import {UsersModule} from "../users/users.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Stock.name, schema: StocksSchema }]), FlagsModule, NewsModule, UsersModule],
  controllers: [StocksController],
  providers: [StocksService]
})
export class StocksModule {}
