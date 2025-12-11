import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { EthersController } from './ethers.controller';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';

@Module({
  controllers: [EthersController],
  providers: [EthersService, EthersSdkService],
})
export class EthersModule {}
