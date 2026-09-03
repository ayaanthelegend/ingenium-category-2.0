import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {DeleteResult, Model, Types} from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import {UpdateUserDto} from "./dto/update-user.dto";
import {Stock, StocksDocument} from "../stocks/schemas/stocks.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, balance } = createUserDto;
    const cleanUsername = (username || '').trim();
    const existing = await this.userModel.findOne({ username: cleanUsername }).exec();
    if (existing) throw new ConflictException('Username already exists');

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const created = new this.userModel({
      username: cleanUsername,
      password: hashed,
      balance: balance ?? 200000,
      stocksOwned: [],
    });
    const saved = await created.save();
    const obj = saved.toObject();
    delete (obj as Partial<User>).password;
    return obj;
  }

  async decrementBalance(id: string, amount: number){
    return this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: { balance: -amount } },
    )
  }

  async incrementBalance(id: string, amount: number){
    return this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: { balance: amount } },
    )
  }

  async updateStock(user: UserDocument, stock: StocksDocument, amount: number) {
    const userWStocks = user;
    if (!userWStocks.stocksOwned) {
      userWStocks.stocksOwned = [];
    }
    const stockIndex = userWStocks.stocksOwned.findIndex(s => s.id == String(stock._id))
    if (stockIndex >= 0) {
      userWStocks.stocksOwned[stockIndex].amount += amount
      userWStocks.stocksOwned[stockIndex].boughtAt = new Date()
      userWStocks.stocksOwned[stockIndex].buy = stock.price
    } else {
      userWStocks.stocksOwned.push(
        {
          id: String(stock._id),
          amount,
          boughtAt: new Date(),
          buy: stock.price
        }
      )
    }
    return this.userModel.updateOne({ _id : user._id }, { $set: userWStocks})
  }

  async delete(id: string): Promise<DeleteResult> {
    return this.userModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    const cleanUsername = (username || '').trim();
    return this.userModel.findOne({ username: cleanUsername }).exec();
  }

  async updateUser(id: string, updateUserDto: Partial<UpdateUserDto>) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // For demo/testing only - don't expose plaintext password
  async validatePassword(username: string, plain: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    if (!user) return false;
    return bcrypt.compare(plain, user.password);
  }

  async getAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
}
