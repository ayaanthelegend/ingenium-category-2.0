import {BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import {DeleteResult, Model, Types} from "mongoose";
import {Stock, StocksDocument} from "./schemas/stocks.schema";
import {InjectModel} from "@nestjs/mongoose";
import {CreateStockDto} from "./dto/create-stock.dto";
import {UpdateStockDto} from "./dto/update-stock.dto";
import {News} from "../news/schemas/news.schema";
import {FlagsService} from "../flags/flags.service";
import {NewsService} from "../news/news.service";
import {UsersService} from "../users/users.service";

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name) private stocksModel: Model<StocksDocument>,
    private readonly flagsService: FlagsService,
    private readonly newsService: NewsService,
    private readonly usersService: UsersService
  ) {}

  async getStocksBasedOnNews() {
    const stocks = await this.getStocks();
    const allNews = await this.newsService.getNews();
    const flag = await this.flagsService.getFullFlag('global')

    if (flag) {
      const sorted = [...allNews].sort((a, b) => a.sequence - b.sequence);
      const triggered: News[] = [];
      let accumulatedTime = 0;

      for (const item of sorted) {
        accumulatedTime += item.effectAt;
        const startTime = flag.startedAt ? (typeof flag.startedAt === 'number' ? flag.startedAt : new Date(flag.startedAt).getTime()) : Date.now();
        if (accumulatedTime <= ((Date.now() - startTime) / 1000)) {
          triggered.push(item);
        } else {
          break;
        }
      }

      for (const item of triggered) {
        for (const effect of item.effects) {
          const index = stocks.findIndex(s => (s._id as Types.ObjectId).toHexString() == effect.id)
          if (index >= 0) {
            stocks[index].price = effect.newBuy
            stocks[index].priceHistory.push(effect.newBuy)
          }
        }
      }
      for (const stock of stocks) {
        let price = 100
        switch ((stock._id as Types.ObjectId).toHexString()) {
          case "68d59ff665b970d1077c4e96":
            price = 70
            break;
          case "68d5a01265b970d1077c4e9c":
            price = 95
            break;
          case "68d5a02a65b970d1077c4ea1":
            price = 22
            break;
          case "68d5a03c65b970d1077c4ea4":
            price = 1
            break;
          case "68d5a04c65b970d1077c4ea7":
            price = 45
            break;
          case "68d5a05b65b970d1077c4eaa":
            price = 38
            break;
          case "68d5a06965b970d1077c4ead":
            price = 55
            break;
          case "68d5a07f65b970d1077c4eb0":
            price = 62
            break;
          case "68d5a09465b970d1077c4eb3":
            price = 265
            break;
          case "68d5a0ae65b970d1077c4eb6":
            price = 65
            break;
        }
        stock.priceHistory = [price, ...stock.priceHistory];
      }
      return stocks
    } else throw new InternalServerErrorException();
  }

  async buyStock(id: string, amount: number, userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException()
    const stocks = await this.getStocksBasedOnNews()
    const stock = stocks.find(stock => (stock._id as Types.ObjectId).toHexString() === id);
    if (stock) {
      const priceRequired = amount * stock.price
      if (user.balance >= priceRequired) {

        await this.usersService.updateStock(user, stock, amount)
        return await this.usersService.decrementBalance((user._id as Types.ObjectId).toHexString(), priceRequired)
      } else throw new BadRequestException(`You do not have enough balance. Required : $${priceRequired}, You have : $${user.balance}`)
    } else throw new InternalServerErrorException()
  }

  async sellStock(id: string, amount: number, userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException()
    const stocks = await this.getStocksBasedOnNews()
    const stock = stocks.find(stock => (stock._id as Types.ObjectId).toHexString() === id);
    if (stock) {
      const stockInUser = user.stocksOwned.find(s => s.id == id)
      const priceRequired = amount * stock.price
      if (stockInUser && stockInUser.amount >= amount) {
        await this.usersService.updateStock(user, stock, -1 * amount)
        return await this.usersService.incrementBalance((user._id as Types.ObjectId).toHexString(), priceRequired)
      } else throw new BadRequestException(`You do not have enough stocks. Required : ${amount}, You have : ${stockInUser ? stockInUser.amount : 0}`)
    } else throw new InternalServerErrorException()
  }

  getStocks(): Promise<StocksDocument[]> {
    return this.stocksModel.find().exec()
  }

  createStock(stock: CreateStockDto): Promise<StocksDocument> {
    return this.stocksModel.create({
      name: stock.name,
      price: stock.price,
      priceHistory: []
    })
  }

  deleteStock(stockId: string): Promise<DeleteResult> {
    return this.stocksModel.deleteOne({ _id: new Types.ObjectId(stockId) })
  }

  async updateStock(id: string, updateStockDto: Partial<UpdateStockDto>) {
    return this.stocksModel.findByIdAndUpdate(id, updateStockDto, { new: true }).exec();
  }
}
