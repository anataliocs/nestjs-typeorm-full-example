import { Module } from '@nestjs/common';
import { WormholeService } from './wormhole.service';
import { WormholeController } from './wormhole.controller';

@Module({
  controllers: [WormholeController],
  providers: [WormholeService],
})
export class WormholeModule {}
