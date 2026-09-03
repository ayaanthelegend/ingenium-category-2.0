import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { getModelToken } from '@nestjs/mongoose';
import { News } from './schemas/news.schema';

describe('NewsService', () => {
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: getModelToken(News.name), useValue: {} },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
