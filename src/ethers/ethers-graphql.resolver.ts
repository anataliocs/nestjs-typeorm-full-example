import { Args, Query, Resolver } from '@nestjs/graphql';
import { EthersService } from './ethers.service';
import { LatestBlock } from './models/latest-block';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Resolver((of) => LatestBlock)
export class EthersGraphqlResolver {
  constructor(private readonly ethersService: EthersService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query((returns) => LatestBlock)
  getLatestBlock(@Args('id') id: string): LatestBlock {
    // Placeholder dummy data
    // TODO: Replace with real data from ethers.js
    return {
      creationDate: new Date(),
      blockNumber: 24062310,
      id: id,
      hash: '0x319e18a99131634bdef83c1d12185a2c74fc545342a38dbc6a152875b28ebe8b',
    };
  }
}
