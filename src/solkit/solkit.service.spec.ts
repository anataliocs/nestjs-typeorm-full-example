import { Test, TestingModule } from '@nestjs/testing';
import { SolkitService } from './solkit.service';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';
import { ConfigService } from '@nestjs/config';
import { SolkitSdkConfig } from '../solkitsdk/solkitSdkConfig';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';

describe('SolkitService', () => {
  let service: SolkitService;
  let solkitSdkService: SolkitSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolkitService,
        SolkitSdkService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            rpcServerUrl: 'https://devnet.helius-rpc.com',
            wsServerUrl: 'wss://devnet.helius-rpc.com/',
            providerKeyPrefix: '?api-key=',
            network: 'Devnet',
          } as SolkitSdkConfig,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SOLKIT_RPC_SERVER_URL')
                return 'https://mainnet.helius-rpc.com';
              if (key === 'SOLKIT_WS_SERVER_URL')
                return 'wss://devnet.helius-rpc.com/';
              if (key === 'SOLKIT_RPC_PROVIDER_KEY_PREFIX') return '?api-key=';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SolkitService>(SolkitService);
    solkitSdkService = module.get<SolkitSdkService>(SolkitSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(solkitSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });
});
