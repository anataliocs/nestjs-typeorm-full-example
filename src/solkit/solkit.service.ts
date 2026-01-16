import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';
import { from, Observable } from 'rxjs';
import { SolanaBlockNumber } from './dto/solana-block-number';
import { SolanaBlock } from './model/solana-block';
import { UnixTimestamp } from '@solana/kit';
import { SolanaFinalizedBlock } from './dto/solana-finalized-block';
import { buildMessageEvent, buildWsResponse } from '../common/message-utils';
import { WsResponse } from '@nestjs/websockets';

@Injectable()
export class SolkitService {
  private readonly logger = new Logger(SolkitService.name);

  constructor(private readonly solkitSdkService: SolkitSdkService) {}

  /**
   * SDK Wrapper around `solkitSdkService.getBlockNumber()` to transform
   * the returned `number` to `SolanaBlockNumber` DTO for use in WebSockets, SSE and REST.
   */
  private readonly _getBlockNumberJson: () => Promise<SolanaBlockNumber> =
    async (): Promise<SolanaBlockNumber> =>
      ({
        blockNumber: (
          await this.solkitSdkService.getBlockNumber().send()
        ).toString(),
      }) as SolanaBlockNumber;

  /**
   * SDK Wrapper around `ethersSdkService.getFinalizedBlock()` to transform
   * the returned `BlockOrNull` to `FinalizedBlock` DTO for use in WebSockets, SSE and REST.
   */
  private readonly _getFinalizedBlocksJson: () => Promise<SolanaFinalizedBlock> =
    async (): Promise<SolanaFinalizedBlock> => {
      const finalizedBlock = await (
        await this.solkitSdkService.getFinalizedBlock()
      ).send();

      if (finalizedBlock === null) {
        throw new NotFoundException(`Latest finalized block not found.`);
      }

      return {
        blockNumber: finalizedBlock.blockHeight?.toString() ?? '0',
        date: this.getCreationDateIso(finalizedBlock.blockTime),
        hash: String(finalizedBlock.blockhash ?? ''),
      } as SolanaFinalizedBlock;
    };

  /**
   * For REST API controller. RPC Node connection status.
   */
  serverStatusForApi(): string {
    const rpcServerStatus = this.solkitSdkService.rpcServerStatus;
    this.logger.log(`Solana Kit SDK Server Status: ${rpcServerStatus}`);

    return rpcServerStatus;
  }

  /**
   * For REST API controller.  Latest Solana block number.
   */
  blockNumberForApi(): Observable<SolanaBlockNumber> {
    return from(this._getBlockNumberJson());
  }

  /**
   * For REST API controller.  Latest finalized block details.
   */
  finalizedBlockForApi(): Observable<SolanaFinalizedBlock> {
    return from(this._getFinalizedBlocksJson());
  }

  /**
   * SDK Wrapper around `solkitSdkService.getBlockByNumber(blockNumber)` to transform
   * the returned `` to `Block` GraphQL Model.
   *
   * @returns a `SolanaBlock`
   */
  readonly getBlockByNumberFromSdk = async (
    blockNumber: string,
  ): Promise<SolanaBlock> => {
    const solkitBlock =
      await this.solkitSdkService.getBlockByNumber(blockNumber);

    if (solkitBlock === null) {
      throw new NotFoundException(
        `Solana block not found for blockNumber=${blockNumber}`,
      );
    }

    return {
      blockNumber: solkitBlock.blockHeight?.toString() ?? '0',
      creationDate: this.getCreationDateIso(solkitBlock.blockTime),
      hash: String(solkitBlock.blockhash ?? ''),
      transactionCount: Array.isArray(solkitBlock.transactions)
        ? solkitBlock.transactions.length
        : 0,
    } as SolanaBlock;
  };

  private getCreationDateIso(solkitBlockTime: UnixTimestamp) {
    return solkitBlockTime != null
      ? new Date(Number(solkitBlockTime) * 1000).toISOString()
      : new Date(0).toISOString();
  }

  /**
   * For GraphQL resolver.  Return block details by number.
   *
   * @param blockNumber  Block number to retrieve details for.
   */
  getBlockByNumberForGraphQL(blockNumber: string): Observable<SolanaBlock> {
    return from(this.getBlockByNumberFromSdk(blockNumber));
  }

  /**
   * For use by SSE Controller to emit a stream of Websocket response DTOs.
   * Convert `Promise<MessageEvent<SolanaBlockNumber>>` to `Observable<MessageEvent<SolanaBlockNumber>>`
   *
   * @returns  `Observable<MessageEvent<BlockNumber>`
   */
  subscribeToNewBlockNumbersForSse(): (
    n: number,
  ) => Observable<MessageEvent<SolanaBlockNumber>> {
    return (n: number): Observable<MessageEvent<SolanaBlockNumber>> =>
      from(buildMessageEvent<SolanaBlockNumber>(n, this._getBlockNumberJson));
  }

  /**
   * For use by SSE Controller to emit a stream of Websocket response DTOs.
   * Convert `Promise<MessageEvent<SolanaFinalizedBlock>>` to `Observable<MessageEvent<SolanaFinalizedBlock>>`
   *
   * @returns  `Observable<MessageEvent<SolanaFinalizedBlock>`
   */
  subscribeToFinalizedBlocksForSse(): (
    n: number,
  ) => Observable<MessageEvent<SolanaFinalizedBlock>> {
    return (n: number): Observable<MessageEvent<SolanaFinalizedBlock>> =>
      from(
        buildMessageEvent<SolanaFinalizedBlock>(
          n,
          this._getFinalizedBlocksJson,
        ),
      );
  }

  /**
   * For use by `Gateway` to emit a stream of Websocket response DTOs.
   * Converts raw `Promise<WsResponse<SolanaBlockNumber>>` to `Observable<WsResponse<SolanaBlockNumber>>`
   *
   * @returns  `Observable<WsResponse<SolanaBlockNumber>`
   */
  newBlocksStreamForWebsocket(): (
    n: number,
  ) => Observable<WsResponse<SolanaBlockNumber>> {
    return (n: number): Observable<WsResponse<SolanaBlockNumber>> =>
      from(buildWsResponse<SolanaBlockNumber>(n, this._getBlockNumberJson));
  }

  /**
   * For use by `Gateway` to emit a stream of Websocket response DTOs.
   * Convert `Promise<WsResponse<SolanaFinalizedBlock>>` to `Observable<WsResponse<SolanaFinalizedBlock>>`
   *
   * @returns  `Observable<WsResponse<SolanaFinalizedBlock>`
   */
  finalizedBlocksStreamForWebsocket(): (
    n: number,
  ) => Observable<WsResponse<SolanaFinalizedBlock>> {
    return (n: number): Observable<WsResponse<SolanaFinalizedBlock>> =>
      from(
        buildWsResponse<SolanaFinalizedBlock>(n, this._getFinalizedBlocksJson),
      );
  }
}
