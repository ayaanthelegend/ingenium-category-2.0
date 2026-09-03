import { Test, TestingModule } from '@nestjs/testing';
import { FlagsController } from './flags.controller';
import { FlagsService } from './flags.service';
import { SeedService } from '../seed.service';

describe('FlagsController', () => {
  let controller: FlagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlagsController],
      providers: [
        { provide: FlagsService, useValue: {} },
        { provide: SeedService, useValue: {} },
      ],
    }).compile();

    controller = module.get<FlagsController>(FlagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
