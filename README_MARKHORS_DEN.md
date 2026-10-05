# Markhors Den — Wolves of Wall Street Trading Simulation

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-ea2845?style=flat&logo=nestjs)](https://nestjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)

An interactive stock trading competition platform engineered for high-intensity finance simulations. Features real-time stock execution, breaking news volatility shocks, central bank liquidity operations, and live participant rankings inside an immersive desktop windowing environment.

---

## Live Interactive Demo

| Attribute | Details |
| :--- | :--- |
| **Live Production URL** | [https://markhors-den.vercel.app](https://markhors-den.vercel.app) |
| **Backend API Gateway** | `https://ingenium-category-2-0.onrender.com` |
| **Sample Demo Username** | `demo` |
| **Sample Demo Password** | `demo123` |
| **Starting Liquid Balance**| `$250,000.00` |

> A minimalist in-app feature walkthrough launches upon sign-in to explain each terminal module step by step.

---

## System Architecture

```mermaid
flowchart LR
    subgraph Client["Next.js Trading Desktop"]
        Desk["Desktop Manager"]
        StockM["Stock Exchange"]
        NewsM["News Wire"]
        BankM["Bank Vault"]
        RankM["Leaderboard"]
        TourM["Feature Tour"]
    end

    subgraph Service["NestJS Microservice Engine"]
        Gateway["REST API / Auth Guard"]
        Engine["Market Matching & Price Shocks"]
        Ranking["Valuation Aggregator"]
    end

    subgraph Storage["Database"]
        DB[("MongoDB")]
    end

    Desk --> StockM & NewsM & BankM & RankM & TourM
    StockM & NewsM & BankM & RankM --> Gateway
    Gateway --> Engine & Ranking
    Engine & Ranking --> DB
```

---

## Key Functional Highlights

- **Dynamic Stock Desk**: Instant buy/sell order placement across 17 companies with real-time portfolio rebalancing.
- **Breaking News Engine**: Market-moving headlines that apply immediate valuation shifts to targeted equities.
- **Central Banking & Net Worth Calculation**: Comprehensive liquidity management with total asset tracking:
  $$\text{Net Worth} = \text{Cash} + \sum (\text{Quantity} \times \text{Price})$$
- **Live Leaderboard**: Real-time ranking of competing teams based on mark-to-market valuations.
- **Desktop Window Manager**: Draggable, resizable, stackable window frames replicating an authentic operating system workspace.
- **In-App Guided Tour**: Step-by-step feature onboarding explaining every operational component.

---

## Tech Stack

- **Client**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts
- **API Engine**: NestJS 10, Passport JWT, Mongoose ODM
- **Database**: MongoDB (Production Atlas / In-Memory fallback for local development)
- **Hosting**: Vercel (Edge Frontend) & Render (Backend Service)

---

## Quickstart

```bash
# Clone
git clone https://github.com/ayaanthelegend/markhors-den.git
cd markhors-den

# Install dependencies
npm install
npm install --prefix Den-WOWS-Backend
npm install --prefix Den-WOWS-Frontend

# Run locally
npm run dev
```

---

## License
Licensed under the [GNU General Public License v3.0](LICENSE).
