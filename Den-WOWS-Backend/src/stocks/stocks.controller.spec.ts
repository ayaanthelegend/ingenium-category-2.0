import { Test, TestingModule } from '@nestjs/testing';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { FlagsService } from '../flags/flags.service';

describe('StocksController', () => {
  let controller: StocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StocksController],
      providers: [
        { provide: StocksService, useValue: {} },
        { provide: FlagsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<StocksController>(StocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
