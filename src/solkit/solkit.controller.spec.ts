import { Test, TestingModule } from '@nestjs/testing';
import { SolkitController } from './solkit.controller';
import { SolkitService } from './solkit.service';

describe('SolkitController', () => {
  let controller: SolkitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolkitController],
      providers: [SolkitService],
    }).compile();

    controller = module.get<SolkitController>(SolkitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
