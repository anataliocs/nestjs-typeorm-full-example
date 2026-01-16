import { Module } from '@nestjs/common';
import { SolkitService } from './solkit.service';
import { SolkitController } from './solkit.controller';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';
import { SolkitGraphqlResolver } from './solkit-graphql.resolver';
import SolkitSseController from './solkit.sse.controller';

@Module({
  controllers: [SolkitController, SolkitSseController],
  providers: [SolkitService, SolkitSdkService, SolkitGraphqlResolver],
})
export class SolkitModule {}
