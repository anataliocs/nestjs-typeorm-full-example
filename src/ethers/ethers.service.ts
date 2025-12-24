import { Injectable, Logger } from '@nestjs/common';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { from, Observable } from 'rxjs';
import { WsResponse } from '@nestjs/websockets';
import { FinalizedBlock } from './dto/finalized-block';
import { BlockNumber } from './dto/block-number';
import { Block } from './models/block';

@Injectable()
export class EthersService {
  private readonly logger = new Logger(EthersService.name);

  constructor(private readonly ethersSdkService: EthersSdkService) {}

  /**
   * SDK Wrapper around `ethersSdkService.getBlockNumber()` to transform
   * the returned `number` to `BlockNumber` DTO for use in WebSockets, SSE and REST.
   */
  readonly _getBlockNumberJson: () => Promise<BlockNumber> =
    async (): Promise<BlockNumber> =>
      ({
        blockNumber: await this.ethersSdkService.getBlockNumber(),
      }) as BlockNumber;

  /**
   * SDK Wrapper around `ethersSdkService.getFinalizedBlock()` to transform
   * the returned `BlockOrNull` to `FinalizedBlock` DTO for use in WebSockets, SSE and REST.
   */
  readonly _getFinalizedBlocksJson: () => Promise<FinalizedBlock> =
    async (): Promise<FinalizedBlock> => {
      const blockOrNull = await this.ethersSdkService.getFinalizedBlock();
      if (blockOrNull === null) {
        return {} as FinalizedBlock;
      }

      return {
        blockNumber: blockOrNull.number,
        date: blockOrNull.date ?? '',
        hash: blockOrNull.hash ?? '',
      } as FinalizedBlock;
    };

  /**
   * SDK Wrapper around `ethersSdkService.getBlock(blockNumber)` to transform
   * the returned `BlockOrNull` to `Block` GraphQL Model.
   *
   * Returns `{}` if ethers SDK returns `null` for the block.
   */
  readonly _getBlockByNumberGraphQL = async (blockNumber: number) => {
    const blockOrNull = await this.ethersSdkService.getBlock(blockNumber);
    return blockOrNull === null
      ? ({} as Block)
      : ({
          creationDate: blockOrNull.date ?? '',
          blockNumber: blockOrNull.number,
          hash: blockOrNull.hash ?? '',
          transactionCount: blockOrNull.length ?? 0,
          nonce: blockOrNull.nonce ?? '',
        } as Block);
  };

  /**
   * For REST API controller. RPC Node connection status.
   */
  serverStatusForApi(): string {
    const rpcServerStatus = this.ethersSdkService.rpcServerStatus;
    this.logger.log(`Ethers SDK Server Status: ${rpcServerStatus}`);

    return rpcServerStatus;
  }

  /**
   * For REST API controller.  Latest block number.
   */
  blockNumberForApi(): Observable<BlockNumber> {
    return from(this._getBlockNumberJson());
  }

  /**
   * For REST API controller.  Latest finalized block details.
   */
  finalizedBlockForApi(): Observable<FinalizedBlock> {
    return from(this._getFinalizedBlocksJson());
  }

  /**
   * For GraphQL resolver.  Return block details by number.
   *
   * @param blockNumber  Block number to retrieve details for.
   */
  getBlockByNumberForGraphQL(blockNumber: number): Observable<Block> {
    return from(this._getBlockByNumberGraphQL(blockNumber));
  }

  /**
   * For use by `Gateway` to emit a stream of Websocket response DTOs.
   * Converts raw `Promise<WsResponse<BlockNumber>>` to `Observable<WsResponse<BlockNumber>>`
   *
   * @returns  `Observable<WsResponse<BlockNumber>`
   */
  newBlocksStreamForWebsocket(): (
    n: number,
  ) => Observable<WsResponse<BlockNumber>> {
    return (n: number): Observable<WsResponse<BlockNumber>> =>
      from(this.buildWsResponse<BlockNumber>(n, this._getBlockNumberJson));
  }

  /**
   * For use by `Gateway` to emit a stream of Websocket response DTOs.
   * Convert `Promise<WsResponse<FinalizedBlock>>` to `Observable<WsResponse<FinalizedBlock>>`
   *
   * @returns  `Observable<WsResponse<FinalizedBlock>`
   */
  finalizedBlocksStreamForWebsocket(): (
    n: number,
  ) => Observable<WsResponse<FinalizedBlock>> {
    return (n: number): Observable<WsResponse<FinalizedBlock>> =>
      from(
        this.buildWsResponse<FinalizedBlock>(n, this._getFinalizedBlocksJson),
      );
  }

  /**
   * For use by SSE Controller to emit a stream of Websocket response DTOs.
   * Convert `Promise<MessageEvent<BlockNumber>>` to `Observable<MessageEvent<BlockNumber>>`
   *
   * @returns  `Observable<MessageEvent<BlockNumber>`
   */
  subscribeToNewBlocksForSse(): (
    n: number,
  ) => Observable<MessageEvent<BlockNumber>> {
    return (n: number): Observable<MessageEvent<BlockNumber>> =>
      from(this.buildMessageEvent<BlockNumber>(n, this._getBlockNumberJson));
  }

  /**
   * For use by SSE Controller to emit a stream of Websocket response DTOs.
   * Convert `Promise<MessageEvent<FinalizedBlock>>` to `Observable<MessageEvent<FinalizedBlock>>`
   *
   * @returns  `Observable<MessageEvent<FinalizedBlock>`
   */
  subscribeToFinalizedBlocksForSse(): (
    n: number,
  ) => Observable<MessageEvent<FinalizedBlock>> {
    return (n: number): Observable<MessageEvent<FinalizedBlock>> =>
      from(
        this.buildMessageEvent<FinalizedBlock>(n, this._getFinalizedBlocksJson),
      );
  }

  /**
   * Build Websocket Response `WsResponse` object setting `data` to the return value
   * of the `sdkFunction` wrapper around an ethers SDK function.
   * `DataType` generic indicates the DTO type to be returned.
   *
   * @returns  `Promise<WsResponse<DataType>>`
   */
  private async buildWsResponse<DataType>(
    n: number,
    sdkFunction: () => Promise<DataType>,
  ): Promise<WsResponse<DataType>> {
    return {
      type: 'events',
      data: await sdkFunction(),
    } as unknown as WsResponse<DataType>;
  }

  /**
   * Build SSE Response `MessageEvent` object setting `data` to the return value
   * of the `sdkFunction` wrapper around an ethers SDK function.
   * `DataType` generic indicates the DTO type to be returned.
   *
   * @returns  `Promise<MessageEvent<DataType>>`
   */
  private async buildMessageEvent<DataType>(
    n: number,
    sdkFunction: () => Promise<DataType>,
  ): Promise<MessageEvent<DataType>> {
    return {
      type: 'message',
      id: n,
      data: await sdkFunction(),
      retry: 0,
    } as unknown as MessageEvent<DataType>;
  }
}
