import { Module } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';
import { BitcoinController } from './bitcoin.controller';

@Module({
  controllers: [BitcoinController],
  providers: [BitcoinService],
})
export class BitcoinModule {}
