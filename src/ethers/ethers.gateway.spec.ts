import { Test, TestingModule } from '@nestjs/testing';
import { EthersGateway } from './ethers.gateway';
import { EthersService } from './ethers.service';
import { EthersSdkConfig } from '../etherssdk/ethersSdkConfig';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { ConfigService } from '@nestjs/config';

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
