import { Test, TestingModule } from '@nestjs/testing';
import { EthersController } from './ethers.controller';
import { EthersService } from './ethers.service';
import { ConfigService } from '@nestjs/config';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { EthersSdkConfig } from '../etherssdk/ethersSdkConfig';
import { firstValueFrom } from 'rxjs';
import { BlockNumber } from './dto/block-number';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';

describe('EthersController', () => {
  let controller: EthersController;
  let service: EthersService;
  let ethersSdkService: EthersSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EthersController],
      providers: [
        EthersService,
        EthersSdkService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            rpcServerUrl: 'https://mainnet.infura.io/v3/', // note trailing slash
            network: 'mainnet',
            apiKey: '0e041bf23121eef2131f2321abf',
          } as EthersSdkConfig,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ETHERS_RPC_SERVER_URL')
                return 'https://mainnet.infura.io/v3/';
              if (key === 'ETHERS_RPC_API_KEY')
                return '0e041bf23121eef2131f2321abf';
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<EthersController>(EthersController);
    service = module.get<EthersService>(EthersService);
    ethersSdkService = module.get<EthersSdkService>(EthersSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(ethersSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('serverStatus() response should be defined', () => {
    const ethersSdkMock = jest
      .spyOn(ethersSdkService, 'rpcServerStatus', 'get')
      .mockReturnValue('Connected');

    const status: string = controller.getServerStatus();
    expect(status).toBeDefined();
    expect(ethersSdkMock).toHaveBeenCalledTimes(1);
    expect(status).toBe('Connected');
  });

  it('blockNumber() response should be defined', async () => {
    const ethersSdkMock = jest
      .spyOn(ethersSdkService, 'getBlockNumber')
      .mockReturnValue(Promise.resolve(123456789));

    const blockNumber: BlockNumber = await firstValueFrom(
      controller.getBlockNumber(),
    );
    expect(blockNumber).toBeDefined();
    expect(ethersSdkMock).toHaveBeenCalledTimes(1);
    expect(blockNumber).toHaveProperty('blockNumber', 123456789);
  });
});
