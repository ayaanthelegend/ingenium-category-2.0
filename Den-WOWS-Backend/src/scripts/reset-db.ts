import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock } from '../stocks/schemas/stocks.schema';
import { News } from '../news/schemas/news.schema';
import { User } from '../users/schemas/user.schema';
import { Flag } from '../flags/schemas/flag.schema';
import { SeedService } from '../seed.service';

async function resetDb() {
  console.log('[ResetDB] Initializing Nest app context for database reset...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const stockModel = app.get<Model<Stock>>(getModelToken(Stock.name));
  const newsModel = app.get<Model<News>>(getModelToken(News.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const flagModel = app.get<Model<Flag>>(getModelToken(Flag.name));
  const seedService = app.get(SeedService);

  console.log('[ResetDB] Wiping existing stocks, news, users, and flags...');
  await stockModel.deleteMany({});
  await newsModel.deleteMany({});
  await userModel.deleteMany({});
  await flagModel.deleteMany({});
  console.log('[ResetDB] Database collections cleared.');

  console.log('[ResetDB] Re-seeding database for Ingenium 2026...');
  await seedService.onModuleInit();
  console.log('[ResetDB] Database reset & re-seed complete!');

  await app.close();
}

resetDb().catch((err) => {
  console.error('[ResetDB] Error resetting database:', err);
  process.exit(1);
});
