import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ethersSdkConfig from './ethersSdkConfig';
import { CONFIG_OPTIONS, SdkService, SdkServiceBase } from '../sdk/sdk.common';
import { ethers, JsonRpcProvider } from 'ethers';

type EthersProvider = JsonRpcProvider;

@Injectable()
export class EthersSdkService
  extends SdkServiceBase<EthersProvider>
  implements SdkService
{
  private readonly logger: Logger = new Logger(EthersSdkService.name);

  private readonly _rpcServerUrl: string;
  private _network: string | ethers.Network;

  constructor(
    private configService: ConfigService,
    @Inject(CONFIG_OPTIONS)
    private options: ethersSdkConfig.EthersSdkConfig,
  ) {
    super(`Ethers SDK Rpc Server is not initialized.`);
    // Use environment variable if set, otherwise use the value from module options
    this._rpcServerUrl =
      this.configService.get<string>('ETHERS_RPC_SERVER_URL') ||
      options.rpcServerUrl;
    this._network = options.network;
    // https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcProvider
    this._rpcServer = new ethers.JsonRpcProvider(
      this._rpcServerUrl + this.configService.get<string>('ETHERS_RPC_API_KEY'),
    );

    this.logger.log(`Ethers SDK Rpc Server Type: ${this._network}`);
  }

  /**
   * Get the current block number (block height).
   * https://docs.ethers.org/v6/api/providers/#Block
   *
   * @returns  `Promise<number>`
   */
  getBlockNumber(): Promise<number> {
    return this._rpcServer.getBlockNumber();
  }

  async onModuleInit() {
    this._network = await this._rpcServer.getNetwork();
    this.connected();
    this.logger.log(
      `Ethers SDK Rpc Server Status: ${this._rpcServerStatus} - RPC Server URL: ${this._rpcServerUrl}`,
    );
  }

  async onApplicationShutdown(_signal?: string) {
    await this._rpcServer?.off({});
    this.disconnected();
    this.logger.log(`Closing Ethers SDK Rpc Server Connection: ${_signal}`);
  }
}
