import { Module } from '@nestjs/common';
import { SolkitService } from './solkit.service';
import { SolkitController } from './solkit.controller';
import { SolkitSdkService } from '../solkitsdk/solkit.sdk.service';

@Module({
  controllers: [SolkitController],
  providers: [SolkitService, SolkitSdkService],
})
export class SolkitModule {}
