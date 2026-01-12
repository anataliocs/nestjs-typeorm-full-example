import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ethersSdkConfig from './solkitSdkConfig';
import { CONFIG_OPTIONS, SdkService, SdkServiceBase } from '../sdk/sdk.common';
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  PendingRpcRequest,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
} from '@solana/kit';

export type SolKitClient = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

@Injectable()
export class SolkitSdkService
  extends SdkServiceBase<SolKitClient>
  implements SdkService
{
  private readonly logger: Logger = new Logger(SolkitSdkService.name);

  private readonly _rpcServerUrl: string;
  private readonly _wsServerUrl: string;
  private readonly _providerKeyPrefix: string;
  private _network: string;

  constructor(
    private configService: ConfigService,
    @Inject(CONFIG_OPTIONS)
    private options: ethersSdkConfig.SolkitSdkConfig,
  ) {
    super(`Solana Kit SDK Rpc Server is not initialized.`);
    // Use environment variable if set, otherwise use the value from module options
    this._rpcServerUrl =
      this.configService.get<string>('SOLKIT_RPC_SERVER_URL') ||
      options.rpcServerUrl;
    this._wsServerUrl =
      this.configService.get<string>('SOLKIT_WS_SERVER_URL') ||
      options.wsServerUrl;
    this._providerKeyPrefix =
      this.configService.get<string>('SOLKIT_RPC_PROVIDER_KEY_PREFIX') || '';
    this._network = options.network;
    this._rpcServer = {
      rpc: createSolanaRpc(this._rpcServerUrl + this.apiKeyString()),
      rpcSubscriptions: createSolanaRpcSubscriptions(
        this._wsServerUrl + this.apiKeyString(),
      ),
    } as SolKitClient;

    this.logger.log(`Ethers SDK Rpc Server Type: ${this._network}`);
  }

  private apiKeyString() {
    return (
      this._providerKeyPrefix +
      this.configService.get<string>('SOLKIT_RPC_API_KEY')
    );
  }

  /**
   * Get the current block number (block height).
   * https://www.solanakit.com/api/type-aliases/GetBlockHeightApi
   *
   * @returns  `PendingRpcRequest<bigint>`
   */
  getBlockNumber(): PendingRpcRequest<bigint> {
    return this._rpcServer.rpc.getBlockHeight();
  }

  onModuleInit() {
    // TODO init logic
    this.connected();
    this.logger.log(
      `Solkit SDK Rpc Server Status: ${this._rpcServerStatus} - RPC Server URL: ${this._rpcServerUrl}`,
    );
  }

  onApplicationShutdown(_signal?: string) {
    // TODO shut down logic
    this.disconnected();
    this.logger.log(`Closing Solkit SDK Rpc Server Connection: ${_signal}`);
  }
}
