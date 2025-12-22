import { Args, Query, Resolver } from '@nestjs/graphql';
import { EthersService } from './ethers.service';
import { Block } from './models/block';
import { Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Resolver((of) => Block)
export class EthersGraphqlResolver {
  constructor(private readonly ethersService: EthersService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query((returns) => Block)
  getBlockByNumber(
    @Args('blockNumber') blockNumber: number,
  ): Observable<Block> {
    return this.ethersService.getBlockByNumberForGraphQL(blockNumber);
  }
}
