import { Controller, Sse } from '@nestjs/common';
import { BlockNumber, EthersService } from './ethers.service';
import { distinct, interval, mergeMap, Observable } from 'rxjs';

@Controller('/ethers/sse')
class EthersSseController {
  constructor(private readonly ethersService: EthersService) {}

  @Sse('/blocknumber')
  newBlocks(): Observable<MessageEvent<BlockNumber>> {
    return interval(5000)
      .pipe(mergeMap(this.ethersService.subscribeToNewBlocks()))
      .pipe(distinct(({ data }) => data.blockNumber));
  }
}

export default EthersSseController;
