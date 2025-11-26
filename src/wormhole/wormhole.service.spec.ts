import { Test, TestingModule } from '@nestjs/testing';
import { WormholeService } from './wormhole.service';
import { ConfigService } from '@nestjs/config';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';
import { WormholeSdkConfig } from '../wormholesdk/wormholeSdkConfig';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { Wormhole } from '@wormhole-foundation/sdk';
import { ChainConfigDto } from './dto/chain-config.dto';
import {
  assertChainConfigDto,
  chainContextMockResponse,
  getWormholeServer,
} from './testutil/wormhole.testhelper';

describe('WormholeService', () => {
  let service: WormholeService;
  let wormholeSdkService: WormholeSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WormholeService, WormholeSdkService, ConfigService],
    })
      .useMocker((token) => {
        if (token === 'CONFIG_OPTIONS') {
          return jest.fn().mockReturnValue({
            wormholeNetwork: 'Testnet',
            platformArray: [evm, solana],
          } as WormholeSdkConfig);
        }
      })
      .compile();

    service = module.get<WormholeService>(WormholeService);
    wormholeSdkService = module.get<WormholeSdkService>(WormholeSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(wormholeSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('serverStatus() response should be defined', () => {
    const wormholeSdkMock = jest
      .spyOn(wormholeSdkService, 'wormholeServerStatus', 'get')
      .mockReturnValue('Connected');

    const status: string = service.serverStatus();
    expect(status).toBeDefined();
    expect(wormholeSdkMock).toHaveBeenCalledTimes(1);
    expect(status).toBe('Connected');
  });

  it('network() response should be defined', () => {
    const wormholeServer: Wormhole<'Testnet'> = getWormholeServer();
    const wormholeServerMock = jest
      .spyOn(wormholeServer, 'network', 'get')
      .mockReturnValue('Testnet');
    const wormholeSdkMock = jest
      .spyOn(wormholeSdkService, 'wormholeServer', 'get')
      .mockReturnValue(wormholeServer);

    const status: string = service.network();
    expect(status).toBeDefined();
    expect(wormholeServerMock).toHaveBeenCalledTimes(1);
    expect(wormholeSdkMock).toHaveBeenCalledTimes(1);
    expect(status).toBe('Testnet');
  });

  it('getChainContext() response should be defined', () => {
    const wormholeServer: Wormhole<'Testnet'> = getWormholeServer();
    const wormholeServerMock = jest
      .spyOn(wormholeServer, 'getChain')
      .mockReturnValue(chainContextMockResponse);
    const wormholeSdkMock = jest
      .spyOn(wormholeSdkService, 'wormholeServer', 'get')
      .mockReturnValue(wormholeServer);

    const chainConfig: ChainConfigDto = service.getChainContext('Ethereum');
    expect(chainConfig).toBeDefined();
    expect(wormholeServerMock).toHaveBeenCalledTimes(1);
    expect(wormholeSdkMock).toHaveBeenCalledTimes(1);
    assertChainConfigDto(chainConfig);
  });
});
