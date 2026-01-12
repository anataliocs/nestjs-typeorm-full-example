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

  private readonly rpcServerUrl: string;
  private readonly wsServerUrl: string;
  private readonly providerKeyPrefix: string;
  private _network: string;

  constructor(
    private configService: ConfigService,
    @Inject(CONFIG_OPTIONS)
    private options: ethersSdkConfig.SolkitSdkConfig,
  ) {
    super(`Solana Kit SDK Rpc Server is not initialized.`);
    this.rpcServerUrl = options.rpcServerUrl;
    this.wsServerUrl = options.wsServerUrl;
    this.providerKeyPrefix = options.providerKeyPrefix;
    this._network = options.network;

    this._rpcServer = {
      rpc: createSolanaRpc(this.rpcServerUrl + this.apiKeyString()),
      rpcSubscriptions: createSolanaRpcSubscriptions(
        this.wsServerUrl + this.apiKeyString(),
      ),
    } as SolKitClient;

    this.logger.log(`Solana kit SDK Rpc Server Type: ${this._network}`);
  }

  private apiKeyString() {
    return (
      this.providerKeyPrefix +
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
      `Solana kit SDK Rpc Server Status: ${this._rpcServerStatus} - RPC Server URL: ${this.rpcServerUrl}`,
    );
  }

  onApplicationShutdown(_signal?: string) {
    // TODO shut down logic
    this.disconnected();
    this.logger.log(`Closing Solana kit SDK Rpc Server Connection: ${_signal}`);
  }
}
