import { Test, TestingModule } from '@nestjs/testing';
import { EthersService } from './ethers.service';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { ConfigService } from '@nestjs/config';
import { EthersSdkConfig } from '../etherssdk/ethersSdkConfig';
import { firstValueFrom } from 'rxjs';
import { BlockNumber } from './dto/block-number';

describe('EthersService', () => {
  let service: EthersService;
  let ethersSdkService: EthersSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthersService,
        EthersSdkService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 'https://mainnet.infura.io/v3/'),
          },
        },
      ],
    })
      .useMocker((token) => {
        if (token === 'CONFIG_OPTIONS') {
          return jest.fn().mockReturnValue({
            rpcServerUrl: 'https://mainnet.infura.io/v3/',
            network: 'Testnet',
          } as EthersSdkConfig);
        }
      })
      .compile();

    service = module.get<EthersService>(EthersService);
    ethersSdkService = module.get<EthersSdkService>(EthersSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(ethersSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('serverStatus() response should be defined', () => {
    const ethersSdkMock = jest
      .spyOn(ethersSdkService, 'rpcServerStatus', 'get')
      .mockReturnValue('Connected');

    const status: string = service.serverStatusForApi();
    expect(status).toBeDefined();
    expect(ethersSdkMock).toHaveBeenCalledTimes(1);
    expect(status).toBe('Connected');
  });

  it('blockNumber() response should be defined', async () => {
    const ethersSdkMock = jest
      .spyOn(ethersSdkService, 'getBlockNumber')
      .mockReturnValue(Promise.resolve(123456789));

    const blockNumber: BlockNumber = await firstValueFrom(
      service.blockNumberForApi(),
    );
    expect(blockNumber).toBeDefined();
    expect(ethersSdkMock).toHaveBeenCalledTimes(1);
    expect(blockNumber).toHaveProperty('blockNumber', 123456789);
  });
});
