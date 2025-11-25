import { Module } from '@nestjs/common';
import { WormholeService } from './wormhole.service';
import { WormholeController } from './wormhole.controller';
import { ConfigModule } from '@nestjs/config';
import { WormholeSdkModule } from '../wormholesdk/wormholeSdkModule';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    WormholeSdkModule.register({
      wormholeNetwork: 'Testnet',
      platformArray: [evm, solana],
    }),
  ],
  controllers: [WormholeController],
  providers: [WormholeService, WormholeSdkService],
  exports: [WormholeSdkModule],
})
export class WormholeModule {}
