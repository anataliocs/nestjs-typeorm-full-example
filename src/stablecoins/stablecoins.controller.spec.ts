import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsController } from './stablecoins.controller';
import { StablecoinsService } from './stablecoins.service';
import { HttpService } from '@nestjs/axios';
import { ReapAccountBalanceDto } from './dto/reap-account-balance.dto';

describe('StablecoinsController', () => {
  let controller: StablecoinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StablecoinsController],
      providers: [StablecoinsService],
    })
      .useMocker((token) => {
        if (token === HttpService) {
          return jest.fn();
        }
      })
      .compile();

    controller = module.get<StablecoinsController>(StablecoinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getCustomersById response should be defined', async () => {
    const balance: ReapAccountBalanceDto =
      await controller.getMasterAccountBalance();
    console.log(balance);
    expect(balance).toBeDefined();
    expect(balance).toHaveProperty('name', 'John');
    expect(balance).toHaveProperty('id', '123');
  });
});
