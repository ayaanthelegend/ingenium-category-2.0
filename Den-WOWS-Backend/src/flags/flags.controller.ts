import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { AdminKeyGuard } from '../auth/admin-key.guard';
import { SeedService } from '../seed.service';

@Controller('flags')
export class FlagsController {
  constructor(
    private flagsService: FlagsService,
    private seedService: SeedService,
  ) {}

  @Post('/start')
  @UseGuards(AdminKeyGuard)
  async startGame(@Body() body?: { durationSeconds?: number }) {
    return this.flagsService.start(body?.durationSeconds);
  }

  @Post('/pause')
  @UseGuards(AdminKeyGuard)
  async pauseGame() {
    return this.flagsService.pause();
  }

  @Post('/reset')
  @UseGuards(AdminKeyGuard)
  async resetGame(@Body() body?: { durationSeconds?: number }) {
    return this.flagsService.reset(body?.durationSeconds);
  }

  @Post('/set-interval')
  @UseGuards(AdminKeyGuard)
  async setInterval(@Body() body: { seconds: number }) {
    return this.flagsService.setIntervalSeconds(body.seconds);
  }

  @Post('/reset-db')
  @UseGuards(AdminKeyGuard)
  async resetDatabase() {
    return this.seedService.resetDatabase();
  }

  @Get('/global')
  async getGlobal() {
    return this.flagsService.getFullFlag('global');
  }

  @Get()
  async getFlags() {
    return this.flagsService.getAllFlags();
  }
}
