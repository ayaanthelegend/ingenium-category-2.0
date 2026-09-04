import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock } from '../stocks/schemas/stocks.schema';
import { News } from '../news/schemas/news.schema';
import { User } from '../users/schemas/user.schema';
import { Flag } from '../flags/schemas/flag.schema';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function exportDb() {
  console.log('[ExportDB] Initializing Nest app context (READ-ONLY)...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const stockModel = app.get<Model<Stock>>(getModelToken(Stock.name));
    const newsModel = app.get<Model<News>>(getModelToken(News.name));
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const flagModel = app.get<Model<Flag>>(getModelToken(Flag.name));

    console.log('[ExportDB] Fetching live data from MongoDB...');
    const users = await userModel.find().lean().exec();
    const stocks = await stockModel.find().lean().exec();
    const news = await newsModel.find().lean().exec();
    const flags = await flagModel.find().lean().exec();

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupData = {
      exportedAt: new Date().toISOString(),
      counts: {
        users: users.length,
        stocks: stocks.length,
        news: news.length,
        flags: flags.length,
      },
      collections: {
        users,
        stocks,
        news,
        flags,
      },
    };

    // Ensure backups directory exists
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `db-backup-${timestamp}.json`;
    const filePath = path.join(backupDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`[ExportDB] SUCCESS! Database backup exported to: ${filePath}`);
    console.log(`[ExportDB] Summary: Users: ${users.length}, Stocks: ${stocks.length}, News: ${news.length}, Flags: ${flags.length}`);
  } catch (error) {
    console.error('[ExportDB] Failed to export database:', error);
  } finally {
    await app.close();
  }
}

exportDb().catch((err) => {
  console.error('[ExportDB] Unexpected error during export:', err);
  process.exit(1);
});
