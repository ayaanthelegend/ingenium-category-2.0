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
        { _id: new Types.ObjectId('68d59ff665b970d1077c4e96'), name: 'AeroDynamics', price: 70, priceHistory: [70] },
        { _id: new Types.ObjectId('68d5a01265b970d1077c4e9c'), name: 'BioGen', price: 95, priceHistory: [95] },
        { _id: new Types.ObjectId('68d5a02a65b970d1077c4ea1'), name: 'CyberCore', price: 22, priceHistory: [22] },
        { _id: new Types.ObjectId('68d5a03c65b970d1077c4ea4'), name: 'Dogecoin X', price: 1, priceHistory: [1] },
        { _id: new Types.ObjectId('68d5a04c65b970d1077c4ea7'), name: 'EcoEnergy', price: 45, priceHistory: [45] },
        { _id: new Types.ObjectId('68d5a05b65b970d1077c4eaa'), name: 'FutureTech', price: 38, priceHistory: [38] },
        { _id: new Types.ObjectId('68d5a06965b970d1077c4ead'), name: 'GlobalLogistics', price: 55, priceHistory: [55] },
        { _id: new Types.ObjectId('68d5a07f65b970d1077c4eb0'), name: 'HyperLoop', price: 62, priceHistory: [62] },
        { _id: new Types.ObjectId('68d5a09465b970d1077c4eb3'), name: 'InfiniteAI', price: 265, priceHistory: [265] },
        { _id: new Types.ObjectId('68d5a0ae65b970d1077c4eb6'), name: 'JupiterMining', price: 65, priceHistory: [65] },
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
          desc: 'Wall Street opens with strong bullish sentiment across tech and energy sectors.',
          sequence: 1,
          effectAt: 60,
          effects: [{ id: '68d5a09465b970d1077c4eb3', newBuy: 290 }],
        },
        {
          headline: 'Quantum Computing Breakthrough',
          desc: 'InfiniteAI announces Next-Gen chip architecture.',
          sequence: 2,
          effectAt: 120,
          effects: [{ id: '68d5a06965b970d1077c4ead', newBuy: 80 }],
        },
        {
          headline: 'Green Energy Subsidy Approved',
          desc: 'Government allocates $50B infrastructure budget for clean energy initiatives.',
          sequence: 3,
          effectAt: 180,
          effects: [{ id: '68d5a04c65b970d1077c4ea7', newBuy: 65 }],
        },
      ]);
      console.log('[SeedService] Seeded initial news events.');
    }
  }
}
