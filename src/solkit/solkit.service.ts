import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';
import { from, Observable } from 'rxjs';
import { SolanaBlockNumber } from './dto/solana-block-number';
import { SolanaBlock } from './model/solana-block';
import { UnixTimestamp } from '@solana/kit';
import { SolanaFinalizedBlock } from './dto/solana-finalized-block';

@Injectable()
export class SolkitService {
  private readonly logger = new Logger(SolkitService.name);

  constructor(private readonly solkitSdkService: SolkitSdkService) {}

  /**
   * SDK Wrapper around `solkitSdkService.getBlockNumber()` to transform
   * the returned `number` to `SolanaBlockNumber` DTO for use in WebSockets, SSE and REST.
   */
  readonly getBlockNumberJson: () => Promise<SolanaBlockNumber> =
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
  readonly _getFinalizedBlocksJson: () => Promise<SolanaFinalizedBlock> =
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
    return from(this.getBlockNumberJson());
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
}
