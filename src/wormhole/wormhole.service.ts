import { Injectable } from '@nestjs/common';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';
import { assertChain, Chain, WormholeConfig } from '@wormhole-foundation/sdk';
import { ChainConfigDto } from './dto/chain-config.dto';

@Injectable()
export class WormholeService {
  constructor(private readonly wormholeSdkService: WormholeSdkService) {}

  serverStatus(): string {
    return this.wormholeSdkService.rpcServerStatus;
  }

  config(): WormholeConfig {
    return this.wormholeSdkService.rpcServer.config;
  }

  network(): string {
    return this.wormholeSdkService.rpcServer.network;
  }

  getChainContext(platform: string): ChainConfigDto {
    assertChain(platform);

    const chainConfig =
      this.wormholeSdkService.rpcServer.getChain<Chain>(platform).config;

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
