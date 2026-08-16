import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FlagsModule } from './flags/flags.module';
import { StocksModule } from './stocks/stocks.module';
import { NewsModule } from './news/news.module';
import { SeedModule } from './seed.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI || 'mongodb://localhost/nest-auth',
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 1,
        socketTimeoutMS: 45000,
      }),
    }),
    UsersModule,
    AuthModule,
    FlagsModule,
    StocksModule,
    NewsModule,
    SeedModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
