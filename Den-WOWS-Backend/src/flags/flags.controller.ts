import {Body, Controller, Get, Patch, Post, UseGuards} from '@nestjs/common';
import { FlagsService } from './flags.service';
import { AdminKeyGuard } from '../auth/admin-key.guard';

@Controller('flags')
export class FlagsController {
  constructor(private flagsService: FlagsService) {}

  @Post('/start')
  @UseGuards(AdminKeyGuard)
  async startGame() {
    return this.flagsService.start()
  }

  @Post('/pause')
  @UseGuards(AdminKeyGuard)
  async pauseGame() {
    return this.flagsService.pause()
  }

  @Get('/global')
  async getGlobal() {
    return this.flagsService.getFullFlag('global')
  }

  @Get()
  async getFlags() {
    return this.flagsService.getAllFlags();
  }
}
