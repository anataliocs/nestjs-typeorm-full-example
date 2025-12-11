import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wormhole, wormhole } from '@wormhole-foundation/sdk';
import { CONFIG_OPTIONS, SdkService, SdkServiceBase } from '../sdk/sdk.common';
import * as wormholeSdkConfig from './wormholeSdkConfig';

export type WormholeServer = Wormhole<'Testnet' | 'Devnet' | 'Mainnet'>;
type AsyncWormholeProvider = () => Promise<WormholeServer>;

@Injectable()
export class WormholeSdkService
  extends SdkServiceBase<WormholeServer>
  implements SdkService
{
  private readonly logger = new Logger(WormholeSdkService.name);
  private readonly _wormholeProvider: AsyncWormholeProvider;

  constructor(
    private configService: ConfigService,
    @Inject(CONFIG_OPTIONS)
    private options: wormholeSdkConfig.WormholeSdkConfig,
  ) {
    super(`Wormhole SDK Server is not initialized.`);
    this._wormholeProvider = async () =>
      await wormhole(options.wormholeNetwork, options.platformArray);
  }

  async onModuleInit() {
    this._rpcServer = await this._wormholeProvider();
    this.connected();

    this.logger.log(
      `Wormhole SDK Server Status: ${this._rpcServerStatus} - Wormhole network: ${this._rpcServer.network}`,
    );
    this.logger.log(
      `Wormhole SDK Server API URL: ${this._rpcServer.config.api}`,
    );
    this.logger.log(
      `Wormhole SDK Server Circle API URL: ${this._rpcServer.config.circleAPI}`,
    );
    this.logger.log(
      `Wormhole SDK Server Executor API URL: ${this._rpcServer.config.executorAPI}`,
    );
  }

  onApplicationShutdown(_signal?: string) {
    this.disconnected();
    this.logger.log(`Closing Wormhole SDK Server Connection: ${_signal}`);
  }
}
