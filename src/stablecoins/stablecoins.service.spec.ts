import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsService } from './stablecoins.service';

describe('StablecoinsService', () => {
  let service: StablecoinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StablecoinsService],
    }).compile();

    service = module.get<StablecoinsService>(StablecoinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
