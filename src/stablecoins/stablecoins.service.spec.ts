import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsService } from './stablecoins.service';
import { HttpService } from '@nestjs/axios';
import { AccountBalanceDto } from './dto/reap/account-balance.dto';

describe('StablecoinsService', () => {
  let service: StablecoinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StablecoinsService],
    })
      .useMocker((token) => {
        if (token === HttpService) {
          return jest.fn();
        }
      })
      .compile();

    service = module.get<StablecoinsService>(StablecoinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getCustomersById response should be defined', async () => {
    const balance: AccountBalanceDto = await service.getMasterAccountBalance();
    console.log(balance);
    expect(balance).toBeDefined();
    expect(balance).toHaveProperty('name', 'John');
    expect(balance).toHaveProperty('id', '123');
  });
});
