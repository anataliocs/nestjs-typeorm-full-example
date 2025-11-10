import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsController } from './stablecoins.controller';
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

describe('StablecoinsController', () => {
  let controller: StablecoinsController;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StablecoinsController],
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
    controller = module.get<StablecoinsController>(StablecoinsController);
  });

  it('service and dependencies should be defined', () => {
    expect(controller).toBeDefined();
    expect(httpService).toBeDefined();
  });

  it('getMasterAccountBalance response should be defined', async () => {
    const balance: AccountBalanceDto =
      await controller.getMasterAccountBalance();
    expect(balance).toBeDefined();
    expect(httpService['get']).toHaveBeenCalledWith('account/balance');
    expect(balance).toHaveProperty('availableBalance', '100');
    expect(balance).toHaveProperty('availableToAllocate', '1000');
  });
});
