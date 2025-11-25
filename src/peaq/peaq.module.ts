import { Module } from '@nestjs/common';
import { PeaqService } from './peaq.service';
import { PeaqController } from './peaq.controller';
import { PeaqSdkService } from '../peaqsdk/peaq.sdk.service';

@Module({
  controllers: [PeaqController],
  providers: [PeaqService, PeaqSdkService],
})
export class PeaqModule {}
