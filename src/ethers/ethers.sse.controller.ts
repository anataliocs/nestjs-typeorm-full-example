import { Controller, Sse } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { distinct, interval, mergeMap, Observable } from 'rxjs';
import { BlockNumber } from './dto/block-number';
import { FinalizedBlock } from './dto/finalized-block';

@Controller('/ethers/sse')
class EthersSseController {
  constructor(private readonly ethersService: EthersService) {}

  @Sse('/block-number')
  newBlocks(): Observable<MessageEvent<BlockNumber>> {
    return interval(5000)
      .pipe(mergeMap(this.ethersService.subscribeToNewBlocksForSse()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }

  @Sse('/finalized-blocks')
  finalizedBlocks(): Observable<MessageEvent<FinalizedBlock>> {
    return interval(5000)
      .pipe(mergeMap(this.ethersService.subscribeToFinalizedBlocksForSse()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }
}

export default EthersSseController;
