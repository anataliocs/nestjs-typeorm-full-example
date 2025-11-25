import { Injectable } from '@nestjs/common';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';
import { WormholeConfig } from '@wormhole-foundation/sdk';

@Injectable()
export class WormholeService {
  constructor(private readonly wormholeSdkService: WormholeSdkService) {}

  serverStatus(): string {
    return this.wormholeSdkService.wormholeServerStatus;
  }

  config(): WormholeConfig {
    return this.wormholeSdkService.wormholeServer.config;
  }
}
