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
    headline: 'Pathogen Genome Sequencing Requires Immediate Restocking of Scarce Rare-Earth Isotope Lasers.',
    desc: 'Laboratories attempting to sequence the mutating spore discover that standard optical equipment is inadequate. Researchers launch an aggressive global scramble to acquire ultra-rare isotopic minerals necessary to calibrate high-powered sequencing lasers.',
    effectsMap: { K333: 760, KIC: 1420, NLB: 1170 },
  },
  {
    sequence: 7,
    headline: 'Trace Elements of Synthetic Spore Detected in Major Southern Grain Silos and Food Processing Facilities.',
    desc: 'Routine agricultural inspections reveal that airborne spores have breached several regional food storage hubs. Regulatory boards order immediate quarantines and destruction of infected harvests, triggering panic across the domestic agricultural supply market.',
    effectsMap: { MLH: 250, SAB: 1310, OMER: 540 },
  },
  {
    sequence: 8,
    headline: 'Emergency Bio-Incinerators Demand Continuous Heavy Fossil Fuel Supply to Destroy Contaminated Medical Waste.',
    desc: 'To permanently neutralize millions of tons of hazardous biological waste, federal authorities order municipal incinerators to run at maximum thermal capacity 24/7. Clean energy sources fail to generate the sustained thermal intensity required, forcing a sudden reliance on heavy liquid hydrocarbons.',
    effectsMap: { NAS: 1750, GFE: 1150, SSM: 560 },
  },
  {
    sequence: 9,
    headline: 'Deep-Space Satellites Repurposed to Track Atmospheric Spore Drift via Thermal Infrared Imaging.',
    desc: 'With terrestrial sensors overwhelmed, space research agencies redirect orbital telemetry satellites downward to map invisible spore plumes floating in the jet stream. The massive data transmission demands hijack commercial orbital bandwidth channels.',
    effectsMap: { IAR: 1040, ACS: 920, KIC: 1480 },
  },
  {
    sequence: 10,
    headline: 'Central Bank Freezes Interbank Lending Operations Amid Nationwide Bio-Security Martial Law Declarations.',
    desc: 'As governments declare localized states of emergency, central banks halt speculative interbank transactions to prevent liquidity drains. Investment banks face sudden capital freezes, while retail depositors scramble for safe physical cash storage options.',
    effectsMap: { SAB: 1550, ABG: 650, BURR: 630 },
  },
  {
    sequence: 11,
    headline: 'Unexplained Sub-Surface Electromagnetic Pulse Fries Regional Telecommunications and Fiber-Optic Hubs.',
    desc: 'A rogue underground energy discharge sends a localized electromagnetic shockwave through financial and commercial sectors. Cloud servers and online-only databases suffer catastrophic memory wipes, crippling firms dependent on live internet connections.',
    effectsMap: { KIC: 1700, ACS: 610, ASB: 2150 },
  },
  {
    sequence: 12,
    headline: 'Raw Iron and Coal Deposits Across Subterranean Mines Found to Be Magnetically Charged by Sub-Surface Anomaly.',
    desc: 'Miners underground report that extracted raw iron and coal are spontaneously developing intense magnetic fields. While traditional steel mills reject the anomalous ore, specialized defense contractors discover the material blocks electromagnetic interference naturally.',
    effectsMap: { SSM: 830, K333: 650, NAS: 1670 },
  },
  {
    sequence: 13,
    headline: 'Smart-Vehicles Stalled Nationwide as Onboard Computers Reject Severe Atmospheric Magnetic Shifts.',
    desc: 'Millions of consumer electric and smart vehicles simultaneously shut down on highways and city streets as their microprocessors register unhandled electromagnetic distortion. Dealerships and consumer manufacturers face an unprecedented wave of paralyzed vehicle liability.',
    effectsMap: { MUB: 1290, AYN: 300, MLH: 220 },
  },
  {
    sequence: 14,
    headline: 'Emergency Architectural Codes Mandate Faraday-Cage and Copper-Mesh Smart Concrete Siding for All Commercial Towers.',
    desc: 'Following the electromagnetic pulse event, city councils pass rigorous building code revisions requiring all standing structures to be shielded against future radiation and magnetic waves. Property owners scramble to retrofit existing high-rises.',
    effectsMap: { OMER: 920, BURR: 450, IAR: 1090 },
  },
  {
    sequence: 15,
    headline: 'Gold-Plated Circuitry Melts Under Intense New Atmospheric Ionization Frequencies and Frequency Spikes.',
    desc: 'The shifting atmospheric frequency causes standard gold-plated electronic connections in industrial machinery to instantly superheat and liquefy. Factories face widespread hardware meltdowns, requiring massive quantities of alternative alloys to re-wire critical systems.',
    effectsMap: { ZSG: 2150, ASB: 1900, SAB: 1490 },
  },
  {
    sequence: 16,
    headline: 'Deep Geothermal Power Stations Successfully Tap Sub-Surface Heat Generated by the Particle Accelerator Anomaly.',
    desc: 'While traditional power grids struggle, clean energy pioneers successfully drill into the thermal fault lines caused by the underground physics anomaly. This yields an endless, highly concentrated geothermal energy source that bypasses conventional grid vulnerabilities.',
    effectsMap: { GFE: 1550, NAS: 1390, K333: 720 },
  },
  {
    sequence: 17,
    headline: 'Laboratory Test Subjects Exposed to Radiation Anomaly Exhibit Rapid, Unpredictable Cellular Adaptation.',
    desc: 'Containment facilities studying the bio-vector report that ambient radiation is accelerating the pathogen\'s mutation rate, causing structural containment failures and forcing research teams to deploy heavy radiation-hardened observation shields.',
    effectsMap: { IAR: 1270, NLB: 920, ABG: 560 },
  },
  {
    sequence: 18,
    headline: 'Digital Transaction Ledgers Corrupted Beyond Repair; Authorities Force Temporary Return to Physical Paper Assets.',
    desc: 'The cumulative effect of electromagnetic interference and server crashes corrupts core interbank digital clearing ledgers. To prevent total commercial paralysis, banking regulators order institutions to revert to physical paper-ledger settlements for all trade.',
    effectsMap: { SAB: 1800, ABG: 210, KIC: 1820 },
  },
  {
    sequence: 19,
    headline: 'Crops Exposed to Ionized Air Exhibit 300% Growth Velocity but Disastrous Chemical Toxicity Profiles.',
    desc: 'Farms caught in the atmospheric ionization path experience explosive plant growth, but agricultural testing reveals the harvested grain is heavily laced with mutagenic toxins, rendering it entirely unfit for human consumption.',
    effectsMap: { MLH: 70, GFE: 1650, BURR: 410 },
  },
  {
    sequence: 20,
    headline: 'Data Center Cooling Towers Flash-Freeze Due to Sudden Atmospheric Temperature Plunges and Ion Storms.',
    desc: 'A freak weather front driven by the upper-atmospheric anomaly causes ambient temperatures around primary cloud server farms to plummet instantly. Water-cooling towers freeze solid, threatening catastrophic hardware meltdowns across major data networks.',
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
    let updatedCount = 0;
    for (const item of QUEUED_NEWS_ITEMS) {
      const existingNews = await newsModel.findOne({ sequence: item.sequence }).exec();

      if (existingNews) {
        // Update verbatim headline and desc if different
        existingNews.headline = item.headline;
        existingNews.desc = item.desc;
        await existingNews.save();
        updatedCount++;
        console.log(`[SeedQueuedNews] Sequence #${item.sequence} updated with verbatim headline and desc.`);
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
      console.log(`[SeedQueuedNews] Queued news #${item.sequence} created successfully.`);
    }

    console.log(`[SeedQueuedNews] Finished! Added ${addedCount}, updated ${updatedCount} queued news items.`);
    return { success: true, addedCount, updatedCount };
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
