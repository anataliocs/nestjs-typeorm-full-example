import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { EthersController } from './ethers.controller';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { EthersGateway } from './ethers.gateway';
import EthersSseController from './ethers.sse.controller';
import { EthersGraphqlResolver } from './ethers-graphql.resolver';

@Module({
  controllers: [EthersController, EthersSseController],
  providers: [
    EthersService,
    EthersSdkService,
    EthersGateway,
    EthersGraphqlResolver,
  ],
})
export class EthersModule {}
