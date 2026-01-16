import { Controller, Sse } from '@nestjs/common';
import { SolkitService } from './solkit.service';
import { distinct, interval, mergeMap, Observable } from 'rxjs';
import { SolanaBlockNumber } from './dto/solana-block-number';

@Controller('/solkit/sse')
class SolkitSseController {
  constructor(private readonly solkitService: SolkitService) {}

  @Sse('/block-number')
  newBlocks(): Observable<MessageEvent<SolanaBlockNumber>> {
    return interval(5000)
      .pipe(mergeMap(this.solkitService.subscribeToNewBlockNumbersForSse()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }

  /*  @Sse('/finalized-blocks')
  finalizedBlocks(): Observable<MessageEvent<FinalizedBlock>> {
    return interval(5000)
      .pipe(mergeMap(this.ethersService.subscribeToFinalizedBlocksForSse()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }*/
}

export default SolkitSseController;
