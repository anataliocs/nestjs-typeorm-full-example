import { Test, TestingModule } from '@nestjs/testing';
import { WormholeService } from './wormhole.service';

describe('WormholeService', () => {
  let service: WormholeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WormholeService],
    }).compile();

    service = module.get<WormholeService>(WormholeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
