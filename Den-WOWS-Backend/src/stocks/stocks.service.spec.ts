import { Test, TestingModule } from '@nestjs/testing';
import { StocksService } from './stocks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Stock } from './schemas/stocks.schema';
import { FlagsService } from '../flags/flags.service';
import { NewsService } from '../news/news.service';
import { UsersService } from '../users/users.service';

describe('StocksService', () => {
  let service: StocksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        { provide: getModelToken(Stock.name), useValue: {} },
        { provide: FlagsService, useValue: {} },
        { provide: NewsService, useValue: {} },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    service = module.get<StocksService>(StocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
