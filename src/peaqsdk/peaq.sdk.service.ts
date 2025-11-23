import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sdk } from '@peaq-network/sdk';
import {
  ChainType,
  CreateInstanceOptions,
} from '@peaq-network/sdk/src/types/common';
import { PeaqConfigDataTypes } from './peaqConfig';

const NOT_CONNECTED = 'Not Connected';
const CONNECTED = 'Connected';

type PeaqSdk = Sdk;
type AsyncRpcServerProvider = () => Promise<PeaqSdk>;

@Injectable()
export class PeaqSdkService implements OnApplicationShutdown, OnModuleInit {
  private readonly logger = new Logger(PeaqSdkService.name);

  get rpcServer(): PeaqSdk {
    if (!this._rpcServer || this._rpcServerStatus === NOT_CONNECTED)
      throw new Error(`Peaq SDK Rpc Server is not initialized.`);
    return this._rpcServer;
  }

  get rpcServerStatus(): string {
    return this._rpcServerStatus;
  }

  private readonly _rpcServerProvider: AsyncRpcServerProvider;
  private _rpcServer: PeaqSdk;
  private _rpcServerStatus: string = NOT_CONNECTED;
  private readonly _rpcServerUrl: string;

  constructor(
    private configService: ConfigService,
    @Inject('CONFIG_OPTIONS')
    private options: Record<string, PeaqConfigDataTypes>,
  ) {
    // Use environment variable if set, otherwise use the value from module options
    this._rpcServerUrl =
      this.configService.get<string>('PEAQ_RPC_SERVER_URL') ||
      options.rpcServerUrl;
    // https://docs.peaq.xyz/sdk-reference/javascript/create-instance
    this._rpcServerProvider = async () =>
      await Sdk.createInstance({
        chainType: options.chainType as ChainType,
        baseUrl: this._rpcServerUrl,
      } as CreateInstanceOptions);

    this.logger.log(`Peaq SDK Rpc Server Type: ${options.chainType}`);
  }

  async onModuleInit() {
    this._rpcServer = await this._rpcServerProvider();
    await this._rpcServer.connect();
    this._rpcServerStatus = CONNECTED;
    this.logger.log(
      `Peaq SDK Rpc Server Status: ${this._rpcServerStatus} - Rpc Server URL: ${this._rpcServerUrl}`,
    );
  }

  async onApplicationShutdown(_signal?: string) {
    await this._rpcServer?.disconnect();
    this._rpcServerStatus = NOT_CONNECTED;
    this.logger.log(`Closing Peaq SDK Rpc Server Connection: ${_signal}`);
  }
}
