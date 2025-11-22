import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sdk } from '@peaq-network/sdk';

@Injectable()
export class PeaqSdkService implements OnApplicationShutdown, OnModuleInit {
  private readonly logger = new Logger(PeaqSdkService.name);

  get rpcServer() {
    return this._rpcServer;
  }

  private readonly _rpcServer: Promise<Sdk>;

  // https://docs.peaq.xyz/sdk-reference/javascript/create-instance
  constructor(
    private configService: ConfigService,
    @Inject('CONFIG_OPTIONS') private options: Record<string, string>,
  ) {
    this._rpcServer = Sdk.createInstance({
      baseUrl:
        this.configService.get<string>('PEAQ_RPC_SERVER_URL') ||
        options.rpcServerUrl,
      chainType: Sdk.ChainType.EVM,
    });
  }

  onModuleInit() {
    this.logger.log(`Peaq SDK Rpc Server Status: - Rpc Server URL:`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onApplicationShutdown(_signal?: string) {
    this.logger.log(`Closing Peaq SDK Rpc Server Connection`);
  }
}
