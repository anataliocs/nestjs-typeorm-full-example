import { Module } from '@nestjs/common';
import { SolkitService } from './solkit.service';
import { SolkitController } from './solkit.controller';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';
import { SolkitGraphqlResolver } from './solkit-graphql.resolver';
import SolkitSseController from './solkit.sse.controller';
import { SolkitGateway } from './solkit.gateway';

@Module({
  controllers: [SolkitController, SolkitSseController],
  providers: [
    SolkitService,
    SolkitSdkService,
    SolkitGraphqlResolver,
    SolkitGateway,
  ],
})
export class SolkitModule {}
