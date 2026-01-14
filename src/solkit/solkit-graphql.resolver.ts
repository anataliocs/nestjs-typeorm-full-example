import { Args, Query, Resolver } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { SolkitService } from './solkit.service';
import { SolanaBlock } from './model/solana-block';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Resolver((of) => SolanaBlock)
export class SolkitGraphqlResolver {
  constructor(private readonly solkitService: SolkitService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query((returns) => SolanaBlock)
  getSolanaBlockByNumber(
    @Args('blockNumber') blockNumber: string,
  ): Observable<SolanaBlock> {
    return this.solkitService.getBlockByNumberForGraphQL(blockNumber);
  }
}
