import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post, Req,
  UseGuards
} from '@nestjs/common';
import {StocksService} from "./stocks.service";
import {AdminKeyGuard} from "../auth/admin-key.guard";
import {CreateStockDto} from "./dto/create-stock.dto";
import {UpdateStockDto} from "./dto/update-stock.dto";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {BuySellStockDto} from "./dto/buy-sell-stock.dto";
import {RequestWithUser} from "../common/RequestWithUser.interface";
import {FeatureFlagGuard, RequireFlag} from "../flags/flag.guard";

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('')
  @RequireFlag('global')
  @UseGuards(FeatureFlagGuard)
  async getStocks() {
    return this.stocksService.getStocksBasedOnNews()
  }

  @Get('admin')
  @UseGuards(AdminKeyGuard)
  async getStocksAdmin() {
    return this.stocksService.getStocksBasedOnNews()
  }

  @Post('')
  @UseGuards(AdminKeyGuard)
  async createStock(@Body() createStockDto: CreateStockDto) {
    return this.stocksService.createStock(createStockDto)
  }

  @Post('/buy/:id')
  @UseGuards(JwtAuthGuard)
  @RequireFlag('global')
  @UseGuards(FeatureFlagGuard)
  async buyStock(@Req() req: RequestWithUser, @Param('id') id: string, @Body() buySellStockDto: BuySellStockDto) {
    return this.stocksService.buyStock(id, buySellStockDto.amount, req.user.userId)
  }

  @Post('/sell/:id')
  @UseGuards(JwtAuthGuard)
  @RequireFlag('global')
  @UseGuards(FeatureFlagGuard)
  async sellStock(@Req() req: RequestWithUser, @Param('id') id: string, @Body() buySellStockDto: BuySellStockDto) {
    return this.stocksService.sellStock(id, buySellStockDto.amount, req.user.userId)
  }

  @Patch(':id')
  @UseGuards(AdminKeyGuard)
  async updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: Partial<UpdateStockDto>,
  ) {
    return this.stocksService.updateStock(id, updateStockDto);
  }

  @Delete(':id')
  @UseGuards(AdminKeyGuard)
  async deleteStock(
    @Param('id') id: string,
  ) {
    return this.stocksService.deleteStock(id);
  }
}
