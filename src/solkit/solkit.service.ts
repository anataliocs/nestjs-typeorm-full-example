import { Injectable, Logger } from '@nestjs/common';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';
import { from, Observable } from 'rxjs';
import { SolanaBlockNumber } from './dto/solana-block-number';

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
}
