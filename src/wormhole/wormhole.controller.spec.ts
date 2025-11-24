import { Test, TestingModule } from '@nestjs/testing';
import { WormholeController } from './wormhole.controller';
import { WormholeService } from './wormhole.service';

describe('WormholeController', () => {
  let controller: WormholeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WormholeController],
      providers: [WormholeService],
    }).compile();

    controller = module.get<WormholeController>(WormholeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
