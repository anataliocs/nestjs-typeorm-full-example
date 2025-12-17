import { Injectable, Logger } from '@nestjs/common';
import { BlockOrNull, EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { from, Observable } from 'rxjs';
import { WsResponse } from '@nestjs/websockets';

export interface BlockNumber {
  blockNumber: number;
}

export interface FinalizedBlock {
  blockNumber: number;
  date?: Date;
  hash?: string;
}

@Injectable()
export class EthersService {
  private readonly logger = new Logger(EthersService.name);

  readonly _getBlockNumberJson: () => Promise<BlockNumber> =
    async (): Promise<BlockNumber> =>
      ({
        blockNumber: await this.ethersSdkService.getBlockNumber(),
      }) as BlockNumber;

  readonly _getFinalizedBlocksJson: () => Promise<FinalizedBlock> =
    async (): Promise<FinalizedBlock> => {
      const blockOrNull = await this.ethersSdkService.getFinalizedBlock();
      if (blockOrNull === null) {
        return {
          blockNumber: 0,
        } as FinalizedBlock;
      }

      return {
        blockNumber: blockOrNull.number,
        date: blockOrNull.date ?? '',
        hash: blockOrNull.hash ?? '',
      } as FinalizedBlock;
    };

  constructor(private readonly ethersSdkService: EthersSdkService) {}

  serverStatus(): string {
    const rpcServerStatus = this.ethersSdkService.rpcServerStatus;
    this.logger.log(`Ethers SDK Server Status: ${rpcServerStatus}`);

    return rpcServerStatus;
  }

  blockNumber(): Observable<number> {
    return from(this.ethersSdkService.getBlockNumber());
  }

  finalizedBlock(): Observable<BlockOrNull> {
    return from(this.ethersSdkService.getFinalizedBlock());
  }

  /**
   * Convert `Promise<WsResponse<BlockNumber>>` to `Observable<WsResponse<BlockNumber>>`
   *
   * @returns  `Observable<WsResponse<BlockNumber>`
   */
  webSocketNewBlocksStream(): (
    n: number,
  ) => Observable<WsResponse<BlockNumber>> {
    return (n: number): Observable<WsResponse<BlockNumber>> =>
      from(this.buildWsResponse<BlockNumber>(n, this._getBlockNumberJson));
  }

  /**
   * Convert `Promise<WsResponse<FinalizedBlock>>` to `Observable<WsResponse<FinalizedBlock>>`
   *
   * @returns  `Observable<WsResponse<FinalizedBlock>`
   */
  webSocketFinalizedBlocksStream(): (
    n: number,
  ) => Observable<WsResponse<FinalizedBlock>> {
    return (n: number): Observable<WsResponse<FinalizedBlock>> =>
      from(
        this.buildWsResponse<FinalizedBlock>(n, this._getFinalizedBlocksJson),
      );
  }

  /**
   * Convert `Promise<MessageEvent>` to `Observable<MessageEvent>`
   *
   * @returns  `Observable<MessageEvent<BlockNumber>`
   */
  subscribeToNewBlocks(): (n: number) => Observable<MessageEvent<BlockNumber>> {
    return (n: number): Observable<MessageEvent<BlockNumber>> =>
      from(this.buildMessageEvent<BlockNumber>(n, this._getBlockNumberJson));
  }

  /**
   * Convert `Promise<MessageEvent>` to `Observable<MessageEvent>`
   *
   * @returns  `Observable<MessageEvent<FinalizedBlock>`
   */
  subscribeToFinalizedBlocks(): (
    n: number,
  ) => Observable<MessageEvent<FinalizedBlock>> {
    return (n: number): Observable<MessageEvent<FinalizedBlock>> =>
      from(
        this.buildMessageEvent<FinalizedBlock>(n, this._getFinalizedBlocksJson),
      );
  }

  private async buildWsResponse<DataType>(
    n: number,
    sdkFunction: () => Promise<DataType>,
  ): Promise<WsResponse<DataType>> {
    return {
      type: 'events',
      data: await sdkFunction(),
    } as unknown as WsResponse;
  }

  private async buildMessageEvent<DataType>(
    n: number,
    sdkFunction: () => Promise<DataType>,
  ): Promise<MessageEvent<DataType>> {
    return {
      type: 'message',
      id: n,
      data: await sdkFunction(),
      retry: 0,
    } as unknown as MessageEvent;
  }
}
