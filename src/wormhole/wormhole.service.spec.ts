import { Test, TestingModule } from '@nestjs/testing';
import { WormholeService } from './wormhole.service';
import { ConfigService } from '@nestjs/config';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';
import { WormholeSdkConfig } from '../wormholesdk/wormholeSdkConfig';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { ChainConfig, ChainContext, Wormhole } from '@wormhole-foundation/sdk';
import { ChainConfigDto } from './dto/chain-config.dto';

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
    const wormholeServer: Wormhole<'Testnet'> = new Wormhole('Testnet', []);
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
    const wormholeServer: Wormhole<'Testnet'> = new Wormhole('Testnet', []);
    const wormholeServerMock = jest
      .spyOn(wormholeServer, 'getChain')
      .mockReturnValue({
        config: {
          key: 'Ethereum',
          platform: 'Evm',
          network: 'Testnet',
          chainId: 2,
          finalityThreshold: 72,
          blockTime: 15000,
          nativeTokenDecimals: 18,
          rpc: '',
          contracts: {
            coreBridge: '0x706abc4E45D419950511e474C7B9Ed348A4a716c',
          },
          wrappedNative: { symbol: 'WETH' },
        } as ChainConfig<'Testnet', 'Ethereum'>,
      } as ChainContext<'Testnet'>);
    const wormholeSdkMock = jest
      .spyOn(wormholeSdkService, 'wormholeServer', 'get')
      .mockReturnValue(wormholeServer);

    const chainConfig: ChainConfigDto = service.getChainContext('Ethereum');
    expect(chainConfig).toBeDefined();
    expect(wormholeServerMock).toHaveBeenCalledTimes(1);
    expect(wormholeSdkMock).toHaveBeenCalledTimes(1);
    expect(chainConfig).toHaveProperty('chainId', 2);
    expect(chainConfig).toHaveProperty('rpc', '');
    expect(chainConfig).toHaveProperty('platform', 'Evm');
    expect(chainConfig).toHaveProperty('network', 'Testnet');
    expect(chainConfig).toHaveProperty('blockTime', 15000);
    expect(chainConfig).toHaveProperty('finality', 72);
    expect(chainConfig).toHaveProperty('nativeTokenDecimals', 18);
    expect(chainConfig).toHaveProperty('wrappedNativeSymbol', 'WETH');
    expect(chainConfig).toHaveProperty(
      'coreBridgeAddress',
      '0x706abc4E45D419950511e474C7B9Ed348A4a716c',
    );
  });
});
