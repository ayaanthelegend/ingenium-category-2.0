import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './users/schemas/user.schema';
import { Stock, StocksDocument } from './stocks/schemas/stocks.schema';
import { News, NewsDocument } from './news/schemas/news.schema';
import { Flag } from './flags/schemas/flag.schema';
import { QUEUED_NEWS_ITEMS, DUMMY_TEST_NEWS_ITEMS, COMPLETED_NEWS_ITEMS_11_15 } from './scripts/seed-queued-news';

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

  async resetDatabase() {
    console.log('[SeedService] Resetting database via admin request...');
    await this.stockModel.deleteMany({});
    await this.newsModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.flagModel.deleteMany({});
    await this.onModuleInit();
    console.log('[SeedService] Database reset & re-seeded successfully.');
    return { success: true, message: 'Database wiped and re-seeded with 17 new stocks!' };
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
    const existingStocks = await this.stockModel.find().exec();

    const buildEffects = (effectsMap: Record<string, any>) => {
      return existingStocks.map((stock) => {
        const stockName = stock.name || '';
        let matchedPrice = -1;

        for (const [ticker, price] of Object.entries(effectsMap)) {
          if (stockName.startsWith(ticker + ' ') || stockName.includes(ticker)) {
            matchedPrice = price;
            break;
          }
        }

        return {
          id: String(stock._id),
          newBuy: matchedPrice,
        };
      });
    };

    const initialPublished = [
      {
        sequence: 1,
        headline: 'PATIENT ZERO CONFIRMED',
        desc: 'Stock market opens with strong bullish sentiment across tech and energy sectors.',
        effectsMap: { KIC: 1750 },
        released: true,
      },
      {
        sequence: 2,
        headline: 'Grid Overload Panic',
        desc: 'Atif Cloud Systems secures major enterprise contracts.',
        effectsMap: { ACS: 1600 },
        released: true,
      },
      {
        sequence: 3,
        headline: 'The concrete exodus',
        desc: 'Gillani FutureEnergies awarded federal clean energy grant.',
        effectsMap: { GFE: 1350 },
        released: true,
      },
      {
        sequence: 4,
        headline: 'Liquid Gold rush',
        desc: 'International logistics networks adjust routing protocols to alleviate regional distribution bottlenecks.',
        effectsMap: { MLH: 550, BURR: 650 },
        released: true,
      },
      {
        sequence: 5,
        headline: 'Logistics Gridlock',
        desc: 'Major institutional liquidity buffers expand as central banking operations reinforce market capitalization.',
        effectsMap: { SAB: 1280, ABG: 1020 },
        released: true,
      },
      {
        sequence: 6,
        headline: 'THE SILICON SCARCITY',
        desc: 'Pathogen Genome Sequencing Requires Immediate Restocking of Scarce Rare-Earth Isotope Lasers.',
        effectsMap: { SSM: 480, AYN: 520, MUB: 1040 },
        released: true,
      },
      {
        sequence: 7,
        headline: 'Agricultural Contamination Scare',
        desc: 'Trace Elements of Synthetic Spore Detected in Major Southern Grain Silos and Food Processing Facilities.',
        effectsMap: { NLB: 1171, K333: 760 },
        released: true,
      },
      {
        sequence: 8,
        headline: 'Petro-Fuel Revival',
        desc: 'Emergency Bio-Incinerators Demand Continuous Heavy Fossil Fuel Supply to Destroy Contaminated Medical Waste.',
        effectsMap: { SAB: 1350, MLH: 250, OMER: 540 },
        released: true,
      },
      {
        sequence: 9,
        headline: 'Astro-Telemetry Solutions',
        desc: 'Deep-Space Satellites Repurposed to Track Atmospheric Spore Drift via Thermal Infrared Imaging.',
        effectsMap: { SSM: 560, GFE: 1150, NAS: 1750 },
        released: true,
      },
      {
        sequence: 10,
        headline: 'Financial Sector Re-routing',
        desc: 'Central Bank Freezes Interbank Lending Operations Amid Nationwide Bio-Security Martial Law Declarations.',
        effectsMap: { KIC: 1480, ACS: 920, IAR: 1040 },
        released: true,
      },
      ...COMPLETED_NEWS_ITEMS_11_15.map((item) => ({ ...item, released: true })),
    ];

    for (const item of initialPublished) {
      const existing = await this.newsModel.findOne({ sequence: item.sequence }).exec();
      if (!existing) {
        await this.newsModel.create({
          sequence: item.sequence,
          headline: item.headline,
          desc: item.desc,
          effects: buildEffects(item.effectsMap),
          released: true,
        });
        console.log(`[SeedService] Seeded published headline #${item.sequence} ("${item.headline}").`);
      } else {
        if (existing.released !== true) {
          existing.released = true;
          await existing.save();
          console.log(`[SeedService] Updated headline #${item.sequence} to released: true.`);
        }
      }
    }

    // Seed test dummy headers if not already seeded
    const flag = await this.flagModel.findOne({ key: 'global' }).exec();
    if (!flag?.dummyHeadersSeeded) {
      for (const item of DUMMY_TEST_NEWS_ITEMS) {
        const existing = await this.newsModel.findOne({ sequence: item.sequence }).exec();
        if (!existing) {
          await this.newsModel.create({
            sequence: item.sequence,
            headline: item.headline,
            desc: item.desc,
            effects: buildEffects(item.effectsMap),
            released: false,
          });
          console.log(`[SeedService] Seeded test dummy headline #${item.sequence} ("${item.headline}").`);
        }
      }
      await this.flagModel.findOneAndUpdate(
        { key: 'global' },
        { dummyHeadersSeeded: true },
      ).exec();
    }

    for (const item of QUEUED_NEWS_ITEMS) {
      const existing = await this.newsModel.findOne({ sequence: item.sequence }).exec();
      if (!existing) {
        await this.newsModel.create({
          sequence: item.sequence,
          headline: item.headline,
          desc: item.desc,
          effects: buildEffects(item.effectsMap),
          released: false,
        });
        console.log(`[SeedService] Seeded queued headline #${item.sequence} ("${item.headline}").`);
      } else {
        if (existing.headline !== item.headline || existing.desc !== item.desc) {
          existing.headline = item.headline;
          existing.desc = item.desc;
          await existing.save();
        }
      }
    }

    console.log('[SeedService] News events (1-15 published, 2 dummy test headers, 16-20 queued) verified/seeded.');
  }
}
