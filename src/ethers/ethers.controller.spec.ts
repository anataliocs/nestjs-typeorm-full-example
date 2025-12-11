import { Test, TestingModule } from '@nestjs/testing';
import { EthersController } from './ethers.controller';
import { EthersService } from './ethers.service';
import { ConfigService } from '@nestjs/config';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { EthersSdkConfig } from '../etherssdk/ethersSdkConfig';

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
});
