import { Module } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { EthersController } from './ethers.controller';

@Module({
  controllers: [EthersController],
  providers: [EthersService],
})
export class EthersModule {}
