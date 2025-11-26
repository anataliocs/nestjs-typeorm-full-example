import { Test, TestingModule } from '@nestjs/testing';
import { WormholeController } from './wormhole.controller';
import { WormholeService } from './wormhole.service';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';
import { ConfigService } from '@nestjs/config';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { WormholeSdkConfig } from '../wormholesdk/wormholeSdkConfig';
import { Wormhole } from '@wormhole-foundation/sdk';
import { ChainConfigDto } from './dto/chain-config.dto';
import {
  assertChainConfigDto,
  chainContextMockResponse,
} from './testutil/wormhole.testhelper';

describe('WormholeController', () => {
  let controller: WormholeController;
  let service: WormholeService;
  let wormholeSdkService: WormholeSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WormholeController],
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

    controller = module.get<WormholeController>(WormholeController);
    service = module.get<WormholeService>(WormholeService);
    wormholeSdkService = module.get<WormholeSdkService>(WormholeSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(wormholeSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('serverStatus() response should be defined', () => {
    const wormholeSdkMock = jest
      .spyOn(wormholeSdkService, 'wormholeServerStatus', 'get')
      .mockReturnValue('Connected');

    const status: string = controller.getServerStatus();
    expect(status).toBeDefined();
    expect(wormholeSdkMock).toHaveBeenCalledTimes(1);
    expect(status).toBe('Connected');
  });

  it('network() response should be defined', () => {
    const wormholeServer: Wormhole<'Testnet'> = new Wormhole('Testnet', []);
    const wormholeServerMock = jest
      .spyOn(wormholeServer, 'network', 'get')
      .mockReturnValue('Testnet');
    const wormholeSdkMock = jest
      .spyOn(wormholeSdkService, 'wormholeServer', 'get')
      .mockReturnValue(wormholeServer);

    const status: string = controller.network();
    expect(status).toBeDefined();
    expect(wormholeServerMock).toHaveBeenCalledTimes(1);
    expect(wormholeSdkMock).toHaveBeenCalledTimes(1);
    expect(status).toBe('Testnet');
  });

  it('getChainContext() response should be defined', () => {
    const wormholeServer: Wormhole<'Testnet'> = new Wormhole('Testnet', []);
    const wormholeServerMock = jest
      .spyOn(wormholeServer, 'getChain')
      .mockReturnValue(chainContextMockResponse);
    const wormholeSdkMock = jest
      .spyOn(wormholeSdkService, 'wormholeServer', 'get')
      .mockReturnValue(wormholeServer);

    const chainConfig: ChainConfigDto = controller.chainContext('Ethereum');
    expect(chainConfig).toBeDefined();
    expect(wormholeServerMock).toHaveBeenCalledTimes(1);
    expect(wormholeSdkMock).toHaveBeenCalledTimes(1);
    assertChainConfigDto(chainConfig);
  });
});
