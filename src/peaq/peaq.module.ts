import { Module } from '@nestjs/common';
import { PeaqService } from './peaq.service';
import { PeaqController } from './peaq.controller';

@Module({
  controllers: [PeaqController],
  providers: [PeaqService],
})
export class PeaqModule {}
