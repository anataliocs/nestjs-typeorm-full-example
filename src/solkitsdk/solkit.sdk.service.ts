import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ethersSdkConfig from './solkitSdkConfig';
import { CONFIG_OPTIONS, SdkService, SdkServiceBase } from '../sdk/sdk.common';
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  GetBlockApi,
  GetSlotApi,
  PendingRpcRequest,
  Rpc,
  RpcSubscriptions,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
} from '@solana/kit';

export type SolanaRpcServer = {
  rpcBlockHeightApi: Rpc<SolanaRpcApi>;
  rpcGetBlockApi: Rpc<GetBlockApi>;
  rpcGetSlotApi: Rpc<GetSlotApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
};

@Injectable()
export class SolkitSdkService
  extends SdkServiceBase<SolanaRpcServer>
  implements SdkService
{
  private readonly logger: Logger = new Logger(SolkitSdkService.name);

  private readonly rpcServerUrl: string;
  private readonly wsServerUrl: string;
  private readonly providerKeyPrefix: string;
  private readonly network: string;

  constructor(
    private configService: ConfigService,
    @Inject(CONFIG_OPTIONS)
    private options: ethersSdkConfig.SolkitSdkConfig,
  ) {
    super(`Solana Kit SDK Rpc Server is not initialized.`);
    this.rpcServerUrl = options.rpcServerUrl;
    this.wsServerUrl = options.wsServerUrl;
    this.providerKeyPrefix = options.providerKeyPrefix;
    this.network = options.network;

    this._rpcServer = {
      rpcBlockHeightApi: createSolanaRpc(
        this.rpcServerUrl + this.apiKeyString(),
      ),
      rpcGetBlockApi: createSolanaRpc(
        this.rpcServerUrl + this.apiKeyString(),
        {},
      ),
      rpcGetSlotApi: createSolanaRpc(this.rpcServerUrl + this.apiKeyString()),
      rpcSubscriptions: createSolanaRpcSubscriptions(
        this.wsServerUrl + this.apiKeyString(),
      ),
    } as SolanaRpcServer;

    this.logger.log(`Solana Kit SDK Rpc Server Type: ${this.network}`);
  }

  private apiKeyString() {
    return (
      this.providerKeyPrefix +
      this.configService.get<string>('SOLKIT_RPC_API_KEY')
    );
  }

  /**
   * Get the latest block number (block height).
   * @see https://www.solanakit.com/api/type-aliases/GetBlockHeightApi
   *
   * @returns  `PendingRpcRequest<bigint>`
   */
  getBlockNumber(): PendingRpcRequest<bigint> {
    return this._rpcServer.rpcBlockHeightApi.getBlockHeight({
      commitment: 'finalized',
    });
  }

  /**
   * Get the latest finalized block.
   * @see https://www.solanakit.com/api/type-aliases/Commitment
   * @see https://www.solanakit.com/api/type-aliases/GetSlotApi
   * @see https://www.solanakit.com/api/type-aliases/GetBlockApi
   *
   * @returns  `PendingRpcRequest<bigint>`
   */
  async getFinalizedBlock() {
    const finalizedSlot: bigint = await this._rpcServer.rpcGetSlotApi
      .getSlot({ commitment: 'finalized' })
      .send();

    return this._rpcServer.rpcGetBlockApi.getBlock(finalizedSlot, {
      commitment: 'finalized',
      maxSupportedTransactionVersion: 0,
    });
  }

  /**
   * Get block by number.
   * - maxSupportedTransactionVersion: 0
   * @see https://www.solanakit.com/api/type-aliases/GetBlockApi#getblock
   *
   * @returns  `PendingRpcRequest<bigint>`
   */
  getBlockByNumber(blockNumber: string) {
    return this._rpcServer.rpcGetBlockApi
      .getBlock(BigInt(blockNumber), {
        maxSupportedTransactionVersion: 0,
      })
      .send();
  }

  onModuleInit() {
    // TODO init logic
    this.connected();
    this.logger.log(
      `Solana Kit SDK Rpc Server Status: ${this._rpcServerStatus} - RPC Server URL: ${this.rpcServerUrl}`,
    );
  }

  onApplicationShutdown(_signal?: string) {
    // TODO shut down logic
    this.disconnected();
    this.logger.log(`Closing Solana Kit SDK Rpc Server Connection: ${_signal}`);
  }
}
