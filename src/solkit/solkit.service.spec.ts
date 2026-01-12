import { Test, TestingModule } from '@nestjs/testing';
import { SolkitService } from './solkit.service';

describe('SolkitService', () => {
  let service: SolkitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolkitService],
    }).compile();

    service = module.get<SolkitService>(SolkitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
