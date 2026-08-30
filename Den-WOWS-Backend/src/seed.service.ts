import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users/schemas/user.schema';
import { Stock, StocksDocument } from './stocks/schemas/stocks.schema';
import { News, NewsDocument } from './news/schemas/news.schema';
import { Flag } from './flags/schemas/flag.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Stock.name) private stockModel: Model<StocksDocument>,
    @InjectModel(News.name) private newsModel: Model<NewsDocument>,
    @InjectModel(Flag.name) private flagModel: Model<Flag>,
  ) {}

  async onModuleInit() {
    console.log('[SeedService] Checking database initial seed state...');
    await this.seedFlag();
    await this.seedUsers();
    await this.seedStocks();
    await this.seedNews();
    console.log('[SeedService] Database initialization complete.');
  }

  private async seedFlag() {
    const flag = await this.flagModel.findOne({ key: 'global' }).exec();
    if (!flag) {
      await this.flagModel.create({
        key: 'global',
        value: true,
        startedAt: Date.now(),
        accumulatedSeconds: 0,
      });
      console.log('[SeedService] Created global feature flag.');
    }
  }

  private async seedUsers() {
    const count = await this.userModel.countDocuments().exec();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await this.userModel.create([
        {
          username: 'trader',
          password: hashedPassword,
          balance: 100000,
          stocksOwned: [],
        },
        {
          username: 'wolf',
          password: hashedPassword,
          balance: 500000,
          stocksOwned: [],
        },
      ]);
      console.log('[SeedService] Seeded default user accounts (trader, wolf).');
    }
  }

  private async seedStocks() {
    const count = await this.stockModel.countDocuments().exec();
    if (count === 0) {
      const defaultStocks = [
        { _id: new Types.ObjectId('68d5b10165b970d1077c5001'), name: 'SAB (Sadiq Bancorp)', price: 1200, priceHistory: [1200] },
        { _id: new Types.ObjectId('68d5b10265b970d1077c5002'), name: 'ABG (Asif Banking Group)', price: 950, priceHistory: [950] },
        { _id: new Types.ObjectId('68d5b10365b970d1077c5003'), name: 'BURR (Burr Builders)', price: 600, priceHistory: [600] },
        { _id: new Types.ObjectId('68d5b10465b970d1077c5004'), name: 'OMER (Omer Industries)', price: 800, priceHistory: [800] },
        { _id: new Types.ObjectId('68d5b10565b970d1077c5005'), name: 'K333 (Kashif 333 Mining)', price: 450, priceHistory: [450] },
        { _id: new Types.ObjectId('68d5b10665b970d1077c5006'), name: 'SSM (S&S Miners)', price: 550, priceHistory: [550] },
        { _id: new Types.ObjectId('68d5b10765b970d1077c5007'), name: 'GFE (Gillani FutureEnergies)', price: 1100, priceHistory: [1100] },
        { _id: new Types.ObjectId('68d5b10865b970d1077c5008'), name: "NAS (Nasik's Oilers)", price: 1400, priceHistory: [1400] },
        { _id: new Types.ObjectId('68d5b10965b970d1077c5009'), name: 'AYN (AyaanAutos)', price: 700, priceHistory: [700] },
        { _id: new Types.ObjectId('68d5b10a65b970d1077c5010'), name: 'MUB (Mubashir Motors)', price: 850, priceHistory: [850] },
        { _id: new Types.ObjectId('68d5b10b65b970d1077c5011'), name: 'KIC (Khokhar IT Consultancy)', price: 1500, priceHistory: [1500] },
        { _id: new Types.ObjectId('68d5b10c65b970d1077c5012'), name: 'ACS (Atif Cloud Systems)', price: 1350, priceHistory: [1350] },
        { _id: new Types.ObjectId('68d5b10d65b970d1077c5013'), name: 'NLB (Nouman Labs)', price: 900, priceHistory: [900] },
        { _id: new Types.ObjectId('68d5b10e65b970d1077c5014'), name: 'IAR (Ijaz AstroResearch)', price: 750, priceHistory: [750] },
        { _id: new Types.ObjectId('68d5b10f65b970d1077c5015'), name: 'ZSG (Zahid-Sial Gold Refinery)', price: 2000, priceHistory: [2000] },
        { _id: new Types.ObjectId('68d5b11065b970d1077c5016'), name: 'ASB (ASB Precious Metals)', price: 1650, priceHistory: [1650] },
        { _id: new Types.ObjectId('68d5b11165b970d1077c5017'), name: 'MLH (Malhi Mills)', price: 500, priceHistory: [500] },
      ];
      await this.stockModel.create(defaultStocks);
      console.log('[SeedService] Seeded default stock market listings.');
    }
  }

  private async seedNews() {
    const count = await this.newsModel.countDocuments().exec();
    if (count === 0) {
      await this.newsModel.create([
        {
          headline: 'Market Opening Surge',
          desc: 'Stock market opens with strong bullish sentiment across tech and energy sectors.',
          sequence: 1,
          effectAt: 60,
          effects: [{ id: '68d5b10b65b970d1077c5011', newBuy: 1750 }],
        },
        {
          headline: 'Cloud Infrastructure Breakthrough',
          desc: 'Atif Cloud Systems secures major enterprise contracts.',
          sequence: 2,
          effectAt: 120,
          effects: [{ id: '68d5b10c65b970d1077c5012', newBuy: 1600 }],
        },
        {
          headline: 'Clean Energy Grant Approved',
          desc: 'Gillani FutureEnergies awarded federal clean energy grant.',
          sequence: 3,
          effectAt: 180,
          effects: [{ id: '68d5b10765b970d1077c5007', newBuy: 1350 }],
        },
      ]);
      console.log('[SeedService] Seeded initial news events.');
    }
  }
}
