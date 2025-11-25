import { Module } from '@nestjs/common';
import { WormholeService } from './wormhole.service';
import { WormholeController } from './wormhole.controller';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';

@Module({
  controllers: [WormholeController],
  providers: [WormholeService, WormholeSdkService],
})
export class WormholeModule {}
