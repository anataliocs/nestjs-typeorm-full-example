import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Network,
  PlatformLoader,
  Wormhole,
  wormhole,
} from '@wormhole-foundation/sdk';
import { WormholeConfigDataTypes } from './wormholeConfig';

const NOT_CONNECTED = 'Not Connected';
const CONNECTED = 'Connected';

type WormholeServer = Wormhole<'Testnet' | 'Devnet' | 'Mainnet'>;
type AsyncWormholeProvider = () => Promise<WormholeServer>;

@Injectable()
export class WormholeSdkService implements OnApplicationShutdown, OnModuleInit {
  private readonly logger = new Logger(WormholeSdkService.name);

  get wormholeServer(): WormholeServer {
    if (!this._wormhole || this._wormholeServerStatus === NOT_CONNECTED)
      throw new Error(`Peaq SDK Rpc Server is not initialized.`);
    return this._wormhole;
  }

  get wormholeServerStatus(): string {
    return this._wormholeServerStatus;
  }

  private readonly _wormholeProvider: AsyncWormholeProvider;
  private _wormhole: WormholeServer;
  private _wormholeServerStatus: string = NOT_CONNECTED;
  private readonly _wormholeEnv: string;

  constructor(
    private configService: ConfigService,
    @Inject('CONFIG_OPTIONS')
    private options: Record<string, WormholeConfigDataTypes>,
  ) {
    this._wormholeProvider = async () =>
      await wormhole(
        options.wormholeNetwork as Network,
        options.platformArray as PlatformLoader<any>[],
      );
  }

  async onModuleInit() {
    this._wormhole = await this._wormholeProvider();
    this._wormholeServerStatus = CONNECTED;

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
    this._wormholeServerStatus = NOT_CONNECTED;
    this.logger.log(`Closing Wormhole SDK Server Connection: ${_signal}`);
  }
}
