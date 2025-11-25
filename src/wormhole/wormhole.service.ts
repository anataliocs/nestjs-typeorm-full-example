import { Injectable } from '@nestjs/common';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';
import { assertChain, Chain, WormholeConfig } from '@wormhole-foundation/sdk';
import { ChainConfigDto } from './dto/chain-config.dto';

@Injectable()
export class WormholeService {
  constructor(private readonly wormholeSdkService: WormholeSdkService) {}

  serverStatus(): string {
    return this.wormholeSdkService.wormholeServerStatus;
  }

  config(): WormholeConfig {
    return this.wormholeSdkService.wormholeServer.config;
  }

  network(): string {
    return this.wormholeSdkService.wormholeServer.network;
  }

  getChainContext(platform: string): ChainConfigDto {
    assertChain(platform);

    const chainConfig =
      this.wormholeSdkService.wormholeServer.getChain<Chain>(platform).config;

    return {
      chainId: chainConfig.chainId,
      rpc: chainConfig.rpc || '',
      platform: chainConfig.platform || '',
      network: chainConfig.network || '',
      blockTime: chainConfig.blockTime,
      finality: chainConfig.finalityThreshold,
      nativeTokenDecimals: chainConfig.nativeTokenDecimals,
      wrappedNativeSymbol: chainConfig.wrappedNative?.symbol || '',
      coreBridgeAddress: chainConfig.contracts.coreBridge || '',
    } as ChainConfigDto;
  }
}
