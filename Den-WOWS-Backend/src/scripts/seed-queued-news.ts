import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Stock } from '../stocks/schemas/stocks.schema';
import { News } from '../news/schemas/news.schema';
import * as dotenv from 'dotenv';

dotenv.config();

export const QUEUED_NEWS_ITEMS = [
  {
    sequence: 6,
    headline: 'The Silicon Scarcity',
    desc: 'Labs find standard optics inadequate for sequencing the mutating spore; global scramble for rare isotopic minerals to calibrate high-powered lasers.',
    effectsMap: { K333: 760, KIC: 1420, NLB: 1170 },
  },
  {
    sequence: 7,
    headline: 'Agricultural Contamination Scare',
    desc: 'Airborne spores breach food storage hubs; quarantines and harvest destruction ordered.',
    effectsMap: { MLH: 250, SAB: 1310, OMER: 540 },
  },
  {
    sequence: 8,
    headline: 'Petro-Fuel Revival',
    desc: 'Incinerators run 24/7 to neutralize biological waste; sudden reliance on heavy liquid hydrocarbons.',
    effectsMap: { NAS: 1750, GFE: 1150, SSM: 560 },
  },
  {
    sequence: 9,
    headline: 'Astro-Telemetry Solutions',
    desc: 'Orbital telemetry satellites redirected downward; commercial bandwidth hijacked.',
    effectsMap: { IAR: 1040, ACS: 920, KIC: 1480 },
  },
  {
    sequence: 10,
    headline: 'Financial Sector Re-routing',
    desc: 'Central banks halt speculative lending; retail depositors seek safe cash storage.',
    effectsMap: { SAB: 1550, ABG: 650, BURR: 630 },
  },
  {
    sequence: 11,
    headline: 'The EMP Ripple',
    desc: 'Rogue underground discharge wipes cloud servers and online databases.',
    effectsMap: { KIC: 1700, ACS: 610, ASB: 2150 },
  },
  {
    sequence: 12,
    headline: 'Mineral Magnetic Polarization',
    desc: 'Ore develops magnetic fields; defense contractors want it for EMP shielding.',
    effectsMap: { SSM: 830, K333: 650, NAS: 1670 },
  },
  {
    sequence: 13,
    headline: 'Automotive Electrical Fry',
    desc: 'Smart vehicles shut down nationwide; mechanical diesel trucks are immune.',
    effectsMap: { MUB: 1290, AYN: 300, MLH: 220 },
  },
  {
    sequence: 14,
    headline: 'Real Estate Reinforcement',
    desc: 'New building codes require EM shielding; retrofits scramble.',
    effectsMap: { OMER: 920, BURR: 450, IAR: 1090 },
  },
  {
    sequence: 15,
    headline: 'Precious Metal Conductivity',
    desc: 'Gold-plated electronics overheat and liquefy industrial machinery.',
    effectsMap: { ZSG: 2150, ASB: 1900, SAB: 1490 },
  },
  {
    sequence: 16,
    headline: 'Energy Grid Re-routing',
    desc: 'Geothermal drilling yields endless clean energy, bypassing grid vulnerabilities.',
    effectsMap: { GFE: 1550, NAS: 1390, K333: 720 },
  },
  {
    sequence: 17,
    headline: 'Biotech Genetic Drift',
    desc: 'Radiation accelerates pathogen mutation; containment breaches force radiation-hardened shielding demand.',
    effectsMap: { IAR: 1270, NLB: 920, ABG: 560 },
  },
  {
    sequence: 18,
    headline: 'Banking Liquidity Squeeze',
    desc: 'EM interference corrupts digital clearing ledgers; forced return to paper-ledger settlement.',
    effectsMap: { SAB: 1800, ABG: 210, KIC: 1820 },
  },
  {
    sequence: 19,
    headline: 'Agricultural Mutation Growth',
    desc: 'Explosive crop growth but toxic/mutagenic, unfit for consumption; biomass secretly bought for biofuel.',
    effectsMap: { MLH: 70, GFE: 1650, BURR: 410 },
  },
  {
    sequence: 20,
    headline: 'Cloud Infrastructure Fracture',
    desc: 'Cooling towers freeze solid; corporate clients pay for emergency data salvage.',
    effectsMap: { KIC: 2070, ACS: 410, ZSG: 2240 },
  },
];

export async function seedQueuedNews(appContext?: any) {
  let app = appContext;
  let createdApp = false;
  if (!app) {
    app = await NestFactory.createApplicationContext(AppModule);
    createdApp = true;
  }

  try {
    const stockModel: Model<Stock> = app.get(getModelToken(Stock.name));
    const newsModel: Model<News> = app.get(getModelToken(News.name));

    const existingStocks = await stockModel.find().exec();
    console.log(`[SeedQueuedNews] Found ${existingStocks.length} existing stocks in database.`);

    let addedCount = 0;
    for (const item of QUEUED_NEWS_ITEMS) {
      const existingNews = await newsModel.findOne({ sequence: item.sequence }).exec();
      if (existingNews) {
        console.log(`[SeedQueuedNews] Sequence #${item.sequence} ("${item.headline}") already exists. Skipping.`);
        continue;
      }

      const effects = existingStocks.map((stock) => {
        const stockName = stock.name || '';
        let matchedPrice = -1;

        for (const [ticker, price] of Object.entries(item.effectsMap)) {
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

      await newsModel.create({
        sequence: item.sequence,
        headline: item.headline,
        desc: item.desc,
        effects,
        released: false,
      });

      addedCount++;
      console.log(`[SeedQueuedNews] Queued news #${item.sequence} ("${item.headline}") created successfully.`);
    }

    console.log(`[SeedQueuedNews] Finished! Added ${addedCount} new queued news items.`);
    return { success: true, addedCount };
  } finally {
    if (createdApp && app) {
      await app.close();
    }
  }
}

if (require.main === module) {
  seedQueuedNews()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[SeedQueuedNews] Error seeding queued news:', err);
      process.exit(1);
    });
}
