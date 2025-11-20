import { Test, TestingModule } from '@nestjs/testing';
import { PeaqController } from './peaq.controller';
import { PeaqService } from './peaq.service';

describe('PeaqController', () => {
  let controller: PeaqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeaqController],
      providers: [PeaqService],
    }).compile();

    controller = module.get<PeaqController>(PeaqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
