import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wormhole, wormhole } from '@wormhole-foundation/sdk';
import { CONFIG_OPTIONS, ServerStatus } from '../sdk/sdk.common';
import * as wormholeSdkConfig from './wormholeSdkConfig';

export type WormholeServer = Wormhole<'Testnet' | 'Devnet' | 'Mainnet'>;
type AsyncWormholeProvider = () => Promise<WormholeServer>;

@Injectable()
export class WormholeSdkService implements OnApplicationShutdown, OnModuleInit {
  private readonly logger = new Logger(WormholeSdkService.name);

  private readonly _wormholeProvider: AsyncWormholeProvider;
  private _wormhole: WormholeServer;
  private _wormholeServerStatus: ServerStatus = ServerStatus.NotConnected;

  constructor(
    private configService: ConfigService,
    @Inject(CONFIG_OPTIONS)
    private options: wormholeSdkConfig.WormholeSdkConfig,
  ) {
    this._wormholeProvider = async () =>
      await wormhole(options.wormholeNetwork, options.platformArray);
  }

  get wormholeServer(): WormholeServer {
    if (
      !this._wormhole ||
      this._wormholeServerStatus === ServerStatus.NotConnected
    )
      throw new Error(`Wormhole SDK Server is not initialized.`);
    return this._wormhole;
  }

  get wormholeServerStatus(): string {
    return this._wormholeServerStatus;
  }

  async onModuleInit() {
    this._wormhole = await this._wormholeProvider();
    this._wormholeServerStatus = ServerStatus.Connected;

    this.logger.log(
      `Wormhole SDK Server Status: ${this._wormholeServerStatus} - Wormhole network: ${this._wormhole.network}`,
    );
    this.logger.log(
      `Wormhole SDK Server API URL: ${this._wormhole.config.api}`,
    );
    this.logger.log(
      `Wormhole SDK Server Circle API URL: ${this._wormhole.config.circleAPI}`,
    );
    this.logger.log(
      `Wormhole SDK Server Executor API URL: ${this._wormhole.config.executorAPI}`,
    );
  }

  onApplicationShutdown(_signal?: string) {
    this._wormholeServerStatus = ServerStatus.NotConnected;
    this.logger.log(`Closing Wormhole SDK Server Connection: ${_signal}`);
  }
}
