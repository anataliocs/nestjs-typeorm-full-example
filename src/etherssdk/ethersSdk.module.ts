import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EthersSdkService } from './ethers.sdk.service';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';
import { EthersSdkConfig } from './ethersSdkConfig';

// https://docs.nestjs.com/fundamentals/dynamic-modules
@Module({ imports: [ConfigModule] })
export class EthersSdkModule {
  static register(options: EthersSdkConfig): DynamicModule {
    return {
      module: EthersSdkModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        EthersSdkService,
      ],
      exports: [EthersSdkService],
    };
  }
}
