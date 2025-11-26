import { ChainConfig, ChainContext, Wormhole } from '@wormhole-foundation/sdk';
import { ChainConfigDto } from '../dto/chain-config.dto';

export const chainContextMockResponse = {
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
} as ChainContext<'Testnet'>;

export function getWormholeServer() {
  return new Wormhole('Testnet', []);
}

export function assertChainConfigDto(chainConfig: ChainConfigDto) {
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
}
