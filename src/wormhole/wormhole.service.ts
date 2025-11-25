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

    const chainContext =
      this.wormholeSdkService.wormholeServer.getChain<Chain>(platform);

    return {
      chainId: chainContext.config.chainId,
      rpc: chainContext.config.rpc || '',
    } as ChainConfigDto;
  }
}
