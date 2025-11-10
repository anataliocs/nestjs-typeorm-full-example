import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsService } from './stablecoins.service';
import { HttpService } from '@nestjs/axios';
import { AccountBalanceDto } from './dto/reap/account-balance.dto';
import { mockAxiosResponseByUrl } from './testutil/stablecoin.testhelper';
import { CardDto } from './dto/reap/card.dto';

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
            get: jest.fn((url: string) => mockAxiosResponseByUrl(url)),
            pipe: jest.fn((url: string) => mockAxiosResponseByUrl(url)),
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

  it('service and dependencies should be defined', () => {
    expect(service).toBeDefined();
    expect(httpService).toBeDefined();
  });

  it('getMasterAccountBalance response should be defined', async () => {
    const balance: AccountBalanceDto = await service.getMasterAccountBalance();
    expect(balance).toBeDefined();
    expect(httpService['get']).toHaveBeenCalledWith('account/balance');
    expect(balance).toHaveProperty('availableBalance', '100');
    expect(balance).toHaveProperty('availableToAllocate', '1000');
  });

  it('getCards response should be defined', async () => {
    const cards: CardDto[] = await service.getCards();
    expect(cards).toBeDefined();
    expect(httpService['get']).toHaveBeenCalledWith('cards');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveProperty(
      'id',
      '00000000-0000-0000-0000-000000000000',
    );
    expect(cards[0]).toHaveProperty('cardName', 'John Doe');
  });
});
