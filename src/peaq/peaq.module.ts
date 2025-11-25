import { Module } from '@nestjs/common';
import { PeaqService } from './peaq.service';
import { PeaqController } from './peaq.controller';
import { PeaqSdkService } from '../peaqsdk/peaq.sdk.service';
import { PeaqSdkModule } from '../peaqsdk/peaqSdkModule';
import { ConfigModule } from '@nestjs/config';
import { Sdk } from '@peaq-network/sdk';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PeaqSdkModule.register({
      // Environment variable PEAQ_RPC_SERVER_URL, if set, will override this default value
      rpcServerUrl: 'https://quicknode1.peaq.xyz',
      chainType: Sdk.ChainType.EVM,
    }),
  ],
  controllers: [PeaqController],
  providers: [PeaqService, PeaqSdkService],
  exports: [PeaqSdkModule],
})
export class PeaqModule {}
