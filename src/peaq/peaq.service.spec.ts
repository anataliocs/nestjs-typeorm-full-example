import { Test, TestingModule } from '@nestjs/testing';
import { PeaqService } from './peaq.service';

describe('PeaqService', () => {
  let service: PeaqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeaqService],
    }).compile();

    service = module.get<PeaqService>(PeaqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
