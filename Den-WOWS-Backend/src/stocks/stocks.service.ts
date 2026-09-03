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
    const sorted = [...allNews].sort((a, b) => a.sequence - b.sequence);

    for (const stock of stocks) {
      const initialPrice = stock.price ?? 100;
      const history: number[] = [initialPrice];
      let currentPrice = initialPrice;

      for (const item of sorted) {
        for (const effect of item.effects || []) {
          if (String(stock._id) === effect.id) {
            currentPrice = effect.newBuy;
            history.push(currentPrice);
          }
        }
      }
      stock.price = currentPrice;
      stock.priceHistory = history;
    }
    return stocks;
  }

  async buyStock(id: string, amount: number, userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException()
    const stocks = await this.getStocksBasedOnNews()
    const stock = stocks.find(stock => String(stock._id) === id);
    if (stock) {
      const priceRequired = amount * stock.price
      if (user.balance >= priceRequired) {

        await this.usersService.updateStock(user, stock, amount)
        return await this.usersService.decrementBalance(String(user._id), priceRequired)
      } else throw new BadRequestException(`You do not have enough balance. Required : $${priceRequired}, You have : $${user.balance}`)
    } else throw new InternalServerErrorException()
  }

  async sellStock(id: string, amount: number, userId: string) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException()
    const stocks = await this.getStocksBasedOnNews()
    const stock = stocks.find(stock => String(stock._id) === id);
    if (stock) {
      const stockInUser = user.stocksOwned.find(s => s.id == id)
      const priceRequired = amount * stock.price
      if (stockInUser && stockInUser.amount >= amount) {
        await this.usersService.updateStock(user, stock, -1 * amount)
        return await this.usersService.incrementBalance(String(user._id), priceRequired)
      } else throw new BadRequestException(`You do not have enough stocks. Required : ${amount}, You have : ${stockInUser ? stockInUser.amount : 0}`)
    } else throw new InternalServerErrorException()
  }

  getStocks(): Promise<StocksDocument[]> {
    return this.stocksModel.find().exec()
  }

  createStock(stock: CreateStockDto): Promise<StocksDocument> {
    return this.stocksModel.create({
      name: (stock.name || '').trim(),
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
