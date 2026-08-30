import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FlagsModule } from './flags/flags.module';
import { StocksModule } from './stocks/stocks.module';
import { NewsModule } from './news/news.module';
import { SeedModule } from './seed.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI || 'mongodb://localhost/nest-auth',
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 1,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        retryReads: true,
        connectionFactory: (connection) => {
          connection.on('connected', () => console.log('[MongoDB] Connected successfully.'));
          connection.on('disconnected', () => console.warn('[MongoDB] Connection lost. Attempting reconnect...'));
          connection.on('reconnected', () => console.log('[MongoDB] Reconnected successfully.'));
          connection.on('error', (err: any) => console.error('[MongoDB] Connection error:', err));
          return connection;
        },
      }),
    }),
    UsersModule,
    AuthModule,
    FlagsModule,
    StocksModule,
    NewsModule,
    SeedModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
