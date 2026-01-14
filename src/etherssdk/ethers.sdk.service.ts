import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ethersSdkConfig from './ethersSdkConfig';
import { CONFIG_OPTIONS, SdkService, SdkServiceBase } from '../sdk/sdk.common';
import { Block, ethers, JsonRpcProvider } from 'ethers';

type EthersProvider = JsonRpcProvider;

export type BlockOrNull = Block | null;

@Injectable()
export class EthersSdkService
  extends SdkServiceBase<EthersProvider>
  implements SdkService
{
  private readonly logger: Logger = new Logger(EthersSdkService.name);

  private readonly _rpcServerUrl: string;
  private network: string | ethers.Network;

  constructor(
    private _configService: ConfigService,
    @Inject(CONFIG_OPTIONS)
    private options: ethersSdkConfig.EthersSdkConfig,
  ) {
    super(`Ethers SDK Rpc Server is not initialized.`);
    this._rpcServerUrl = options.rpcServerUrl;
    this.network = options.network;
    // https://docs.ethers.org/v6/api/providers/jsonrpc/#JsonRpcProvider
    this._rpcServer = new ethers.JsonRpcProvider(
      this._rpcServerUrl + options.apiKey,
    );

    this.logger.log(`Ethers SDK Rpc Server Type: ${this.network}`);
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

  /**
   * Get the current FINALIZED block.
   * https://docs.ethers.org/v6/api/providers/#Block
   *
   * @returns  `Promise<BlockOrNull>`
   */
  getFinalizedBlock(): Promise<BlockOrNull> {
    return this._rpcServer.getBlock('finalized');
  }

  /**
   * Get a block by its number.
   * https://docs.ethers.org/v6/api/providers/#Provider-getBlock
   *
   * @param blockHashOrBlockTag
   * @returns `Promise<BlockOrNull>`
   */
  getBlock(blockHashOrBlockTag: ethers.BlockTag): Promise<BlockOrNull> {
    return this._rpcServer.getBlock(blockHashOrBlockTag);
  }

  async onModuleInit() {
    this.network = await this._rpcServer.getNetwork();
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
