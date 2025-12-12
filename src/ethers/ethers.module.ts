import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { EthersController } from './ethers.controller';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import EthersSseController from './ethers.sse.controller';

@Module({
  controllers: [EthersController, EthersSseController],
  providers: [EthersService, EthersSdkService],
})
export class EthersModule {}
