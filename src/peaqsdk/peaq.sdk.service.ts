import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sdk } from '@peaq-network/sdk';
import { CreateInstanceOptions } from '@peaq-network/sdk/src/types/common';
import * as peaqSdkConfig from './peaqSdkConfig';
import { CONFIG_OPTIONS, SdkService, SdkServiceBase } from '../sdk/sdk.common';

type PeaqSdk = Sdk;
type AsyncRpcServerProvider = () => Promise<PeaqSdk>;

@Injectable()
export class PeaqSdkService
  extends SdkServiceBase<PeaqSdk>
  implements SdkService
{
  private readonly logger = new Logger(PeaqSdkService.name);

  private readonly _rpcServerProvider: AsyncRpcServerProvider;
  private readonly _rpcServerUrl: string;

  constructor(
    private configService: ConfigService,
    @Inject(CONFIG_OPTIONS)
    private options: peaqSdkConfig.PeaqSdkConfig,
  ) {
    super(`Peaq SDK Rpc Server is not initialized.`);
    // Use environment variable if set, otherwise use the value from module options
    this._rpcServerUrl =
      this.configService.get<string>('PEAQ_RPC_SERVER_URL') ||
      options.rpcServerUrl;
    // https://docs.peaq.xyz/sdk-reference/javascript/create-instance
    this._rpcServerProvider = async () =>
      await Sdk.createInstance({
        chainType: options.chainType,
        baseUrl: this._rpcServerUrl,
      } as CreateInstanceOptions);

    this.logger.log(`Peaq SDK Rpc Server Type: ${options.chainType}`);
  }

  async onModuleInit() {
    this._rpcServer = await this._rpcServerProvider();
    await this._rpcServer.connect();
    this.connected();
    this.logger.log(
      `Peaq SDK Rpc Server Status: ${this._rpcServerStatus} - Rpc Server URL: ${this._rpcServerUrl}`,
    );
  }

  async onApplicationShutdown(_signal?: string) {
    await this._rpcServer?.disconnect();
    this.disconnected();
    this.logger.log(`Closing Peaq SDK Rpc Server Connection: ${_signal}`);
  }
}
