export interface StockUser {
  id: string;
  amount: number;
  buy: number
  boughtAt: Date;
}
export interface User {
  _id: string;
  username: string;
  password: string;
  balance: number;
  stocksOwned: StockUser[];
}
export interface CreateUserDto {
  username: string;
  password: string;
  balance: number
}
export interface UpdateUserDto {
  username: string;
  balance: number
}
export interface Stock {
  _id: string;
  name: string;
  price: number;
  priceHistory: Array<number>;
}
export interface CreateStockDto {
  name: string;
  price: number;
}
export interface StockEffect {
  id: string;
  newBuy: number;
}
export interface CreateNewsDto {
  headline: string;
  desc: string;
  sequence: number;
  effects: StockEffect[];
  released?: boolean;
}
export interface News {
  _id: string;
  headline: string;
  desc: string;
  sequence: number;
  effects: StockEffect[];
  released?: boolean;
}
export interface UpdateNewsDto {
  headline: string;
  desc: string;
  sequence: number;
  effects?: StockEffect[];
  released?: boolean;
}
export interface Flag {
  key: string;
  value: boolean;
  startedAt: number;
  accumulatedSeconds: number;
  roundDurationSeconds?: number;
  elapsedSeconds?: number;
  timeLeft?: number;
  isAutoPausing?: boolean;
  autoPauseMessage?: string;
  lastReleaseElapsedSeconds?: number;
  newsReleaseIntervalSeconds?: number;
  nextReleaseInSeconds?: number;
}