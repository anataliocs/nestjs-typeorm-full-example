import { Test, TestingModule } from '@nestjs/testing';
import { SolkitController } from './solkit.controller';
import { SolkitService } from './solkit.service';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';
import { ConfigService } from '@nestjs/config';
import { SolkitSdkConfig } from '../solkitsdk/solkitSdkConfig';

// Mock Solana Kit RPC creators to avoid real network/WebSocket initialization during tests
jest.mock('@solana/kit', () => ({
  createSolanaRpc: jest.fn(() => ({
    // provide only the methods used by tests/services
    getBlockHeight: jest.fn(() => ({
      /* PendingRpcRequest mock */
    })),
  })),
  createSolanaRpcSubscriptions: jest.fn(() => ({
    /* RpcSubscriptions mock */
  })),
}));

describe('SolkitController', () => {
  let controller: SolkitController;
  let service: SolkitService;
  let solkitSdkService: SolkitSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolkitController],
      providers: [
        SolkitService,
        SolkitSdkService,
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
    })
      .useMocker((token) => {
        if (token === 'CONFIG_OPTIONS') {
          return jest.fn().mockReturnValue({
            rpcServerUrl: 'https://devnet.helius-rpc.com',
            wsServerUrl: 'wss://devnet.helius-rpc.com/',
            providerKeyPrefix: '?api-key=',
            network: 'Devnet',
          } as SolkitSdkConfig);
        }
      })
      .compile();

    service = module.get<SolkitService>(SolkitService);
    solkitSdkService = module.get<SolkitSdkService>(SolkitSdkService);
    configService = module.get<ConfigService>(ConfigService);
    controller = module.get<SolkitController>(SolkitController);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(solkitSdkService).toBeDefined();
    expect(configService).toBeDefined();
    expect(controller).toBeDefined();
  });
});
