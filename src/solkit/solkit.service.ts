import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';
import { from, Observable } from 'rxjs';
import { SolanaBlockNumber } from './dto/solana-block-number';
import { SolanaBlock } from './model/solana-block';

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
   * SDK Wrapper around `solkitSdkService.getBlockByNumber(blockNumber)` to transform
   * the returned `` to `Block` GraphQL Model.
   *
   * Returns `{}` if Solkit SDK returns `null` for the block.
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

    const creationDateIso =
      solkitBlock.blockTime != null
        ? new Date(Number(solkitBlock.blockTime) * 1000).toISOString()
        : new Date(0).toISOString();

    return {
      blockNumber: solkitBlock.blockHeight?.toString() ?? '0',
      creationDate: creationDateIso,
      hash: String(solkitBlock.blockhash ?? ''),
      transactionCount: Array.isArray(solkitBlock.transactions)
        ? solkitBlock.transactions.length
        : 0,
    } as SolanaBlock;
  };

  /**
   * For GraphQL resolver.  Return block details by number.
   *
   * @param blockNumber  Block number to retrieve details for.
   */
  getBlockByNumberForGraphQL(blockNumber: string): Observable<SolanaBlock> {
    return from(this.getBlockByNumberFromSdk(blockNumber));
  }
}
