import { Test, TestingModule } from '@nestjs/testing';
import { FlagsService } from './flags.service';
import { getModelToken } from '@nestjs/mongoose';
import { Flag } from './schemas/flag.schema';

describe('FlagsService', () => {
  let service: FlagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlagsService,
        { provide: getModelToken(Flag.name), useValue: {} },
      ],
    }).compile();

    service = module.get<FlagsService>(FlagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
