# Goldman's Gambit (Desktop Edition)

> A retro desktop-style trading game where you react to live market news, execute stock trades in real time, and compete to top the leaderboard.

[![Live Site](https://img.shields.io/badge/Play_Live-Goldman's_Gambit-FFBF00?style=for-the-badge&logo=googlechrome&logoColor=black)](https://goldmansgambit-ayaanthelegends-projects.vercel.app)

**Live Demo URL:** [https://goldmansgambit-ayaanthelegends-projects.vercel.app](https://goldmansgambit-ayaanthelegends-projects.vercel.app)  
*(Alternative mirror: [https://goldmansgambit.vercel.app](https://goldmansgambit.vercel.app))*

---

## Overview

Goldman's Gambit immerses you into an institutional-style trading floor packaged inside a nostalgic desktop operating system. Manage multiple floating terminal windows, follow breaking macroeconomic headlines that dynamically shift stock valuations, and trade your way to the top of the firm.

![Goldman's Gambit Desktop](./docs/screenshot-desktop.png)
*Recommended screenshot: The full desktop workspace with the stock terminal, news feed, dock, and session timer visible.*

---

## Features

- **Retro Desktop Workspace**  
  A dark, gold-themed operating system where you can freely drag, stack, minimize, and resize windows just like a desktop computer.

- **Stock Exchange Terminal**  
  Track live prices across listed corporate equities, study historical price trend charts, and execute instant buy and sell orders.

- **Market Intelligence News Feed**  
  Stay plugged into breaking financial news. Every dispatched headline triggers price shocks across specific stocks in real time.

- **Central Bank & Portfolio Tracker**  
  Check your available cash balance, review your total net worth, monitor individual share holdings, and calculate your returns.

- **Competitive Leaderboard**  
  Compete head-to-head with other traders in real time. Rankings update live based on each participant's calculated net worth (cash + stock value).

- **Session Clock & Round Status**  
  A prominent countdown timer displays remaining session time and alerts you whenever the market is active, paused, or receiving a new economic update.

- **Application Dock & Quick Switcher**  
  A bottom application dock lets you launch, minimize, and switch between terminals with ease. The news icon bounces whenever a fresh headline breaks.

- **Interactive Guided Tour**  
  A built-in 7-step onboarding tour with smooth camera zoom and spotlight framing introduces you to each core terminal and control.

- **Mobile Companion Mode**  
  Seamlessly adapt to smaller screens with a dedicated mobile trading layout when accessing from a phone.

---

## How to Use

### 1. Sign In
1. Visit the live site at [https://goldmansgambit-ayaanthelegends-projects.vercel.app](https://goldmansgambit-ayaanthelegends-projects.vercel.app).
2. Enter your assigned username and password.
   > **Guest / Demo Credentials:**  
   > **Username:** `demo`  
   > **Password:** `demo123`  
   > *New accounts start with a default liquid balance of $250,000.*

### 2. Take the Onboarding Tour
- When you first log in, the built-in tour launches automatically to show you around.
- You can restart the tour at any time by clicking the **Tour** icon on the desktop or dock.
- Use **Next** and **Back** to move between steps, or click **Skip Tour** to jump straight into trading.

### 3. Read Breaking News
- Keep an eye on the **Updates** card in the upper-right corner. When a new update arrives, an alert banner will flash.
- Open the **News** terminal to read the full article headline and summary.
- Anticipate market sentiment: determine which sector or company benefits and which ones might drop.

![Breaking News Terminal](./docs/screenshot-news.png)
*Recommended screenshot: The News terminal showing headline articles alongside the updates notification card.*

### 4. Trade Equities
- Launch the **Stocks** application from the left desktop icon grid or bottom dock.
- Select any listed company to inspect its current price, intraday percentage change, and price history chart.
- Click **Buy** or **Sell** to open the order slip, enter your desired number of shares, and confirm your transaction.
- Orders execute immediately against your available liquid cash.

![Stock Exchange Terminal](./docs/screenshot-stocks.png)
*Recommended screenshot: The Stock Market window showing an equity chart and the buy/sell order dialog.*

### 5. Monitor Your Portfolio
- Open the **Bank** program to review your financial summary:
  - **Balance:** Your currently available, uninvested cash.
  - **Net Worth:** Total portfolio value (liquid cash plus market value of all held stocks).
  - **Stock Profile:** Breakdown of each stock you own, total share counts, and current valuation.

### 6. Climb the Leaderboard
- Open the **Scoreboard** window to see the pack rankings.
- The leaderboard ranks all active participants by total net worth in real time.
- Click **View Stocks** next to any participant to inspect their current portfolio holdings.

![Competitive Leaderboard](./docs/screenshot-leaderboard.png)
*Recommended screenshot: The Leaderboard window displaying team rankings and net worth.*

### 7. Manage Windows & Workspace
- **Move:** Drag any window by clicking and holding its header bar.
- **Resize:** Hover over any window edge or corner and drag to expand or shrink.
- **Focus:** Click anywhere on a window to bring it to the front.
- **Close:** Click the **✕** button in the top-right corner of the window.
- **Dock:** Use the icons on the dock at the bottom to reopen or focus programs anytime.

---

## Trading Tips

- **Speed matters:** When news breaks, equity prices update shortly after. Trading before the full market reaction gives you the best spreads.
- **Diversify your portfolio:** Don't put all your capital into a single stock; unexpected adverse headlines can wipe out gains.
- **Keep cash on hand:** Leaving a cash cushion allows you to quickly capitalize on sudden dips when good news arrives.
- **Watch the timer:** Make sure to close open positions or balance your portfolio before the round session timer expires.

---

## Frequently Asked Questions (FAQ)

**Q: What starting balance do I get?**  
A: Every new trading account begins with a demo balance of **$250,000**.

**Q: How is Net Worth calculated?**  
A: `Net Worth = Available Liquid Cash + Sum(Shares Owned × Current Market Price)`.

**Q: Can I play on mobile?**  
A: Yes! When opened on a mobile device, Goldman's Gambit automatically switches to an optimized touch-friendly view.

**Q: What happens when the round ends or pauses?**  
A: The session timer at the top-right will show `[ EVENT PAUSED ]` or `[ MARKET PAUSED — NEW UPDATE INCOMING ]`. Orders are temporarily held until trading resumes.

---

## License

This project is open-source software licensed under the terms described in the [LICENSE](LICENSE) file.
