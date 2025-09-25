import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsController } from './stablecoins.controller';

describe('StablecoinsController', () => {
  let controller: StablecoinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StablecoinsController],
    }).compile();

    controller = module.get<StablecoinsController>(StablecoinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
