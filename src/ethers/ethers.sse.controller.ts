import { Controller, Sse } from '@nestjs/common';
import { BlockNumber, EthersService, FinalizedBlock } from './ethers.service';
import { distinct, interval, mergeMap, Observable } from 'rxjs';

@Controller('/ethers/sse')
class EthersSseController {
  constructor(private readonly ethersService: EthersService) {}

  @Sse('/block-number')
  newBlocks(): Observable<MessageEvent<BlockNumber>> {
    return interval(5000)
      .pipe(mergeMap(this.ethersService.subscribeToNewBlocks()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }

  @Sse('/finalized-blocks')
  finalizedBlocks(): Observable<MessageEvent<FinalizedBlock>> {
    return interval(5000)
      .pipe(mergeMap(this.ethersService.subscribeToFinalizedBlocks()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }
}

export default EthersSseController;
