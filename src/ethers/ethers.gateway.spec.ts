import { Test, TestingModule } from '@nestjs/testing';
import { EthersGateway } from './ethers.gateway';
import { EthersService } from './ethers.service';
import { EthersSdkConfig } from '../etherssdk/ethersSdkConfig';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { ConfigService } from '@nestjs/config';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';

describe('EthersGateway', () => {
  let gateway: EthersGateway;
  let service: EthersService;
  let ethersSdkService: EthersSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthersGateway,
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

    gateway = module.get<EthersGateway>(EthersGateway);
    service = module.get<EthersService>(EthersService);
    ethersSdkService = module.get<EthersSdkService>(EthersSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
    expect(service).toBeDefined();
    expect(ethersSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });
});
