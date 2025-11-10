import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsService } from './stablecoins.service';
import { HttpService } from '@nestjs/axios';
import { AccountBalanceDto } from './dto/reap/account-balance.dto';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

const mockAccountDataDto = {
  availableBalance: '100',
  availableToAllocate: '1000',
} as AccountBalanceDto;

const mockAxiosResponse = {
  data: mockAccountDataDto,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
} as AxiosResponse<AccountBalanceDto, any, object>;

describe('StablecoinsService', () => {
  let service: StablecoinsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StablecoinsService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of(mockAxiosResponse)),
            pipe: jest.fn(() => of(mockAxiosResponse)),
          },
        },
      ],
    })
      .useMocker((token) => {
        if (token === null) {
          return jest.fn();
        }
      })
      .compile();

    httpService = module.get<HttpService>(HttpService);
    service = module.get<StablecoinsService>(StablecoinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getCustomersById response should be defined', async () => {
    const balance: AccountBalanceDto = await service.getMasterAccountBalance();
    console.log(balance);
    expect(balance).toBeDefined();
    expect(httpService['get']).toHaveBeenCalledWith('account/balance');
    expect(balance).toHaveProperty('availableBalance', '100');
    expect(balance).toHaveProperty('availableToAllocate', '1000');
  });
});
