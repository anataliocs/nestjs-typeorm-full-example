import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PeaqSdkService } from './peaq.sdk.service';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';
import { PeaqSdkConfig } from './peaqSdkConfig';

// https://docs.nestjs.com/fundamentals/dynamic-modules
@Module({ imports: [ConfigModule] })
export class PeaqSdkModule {
  static register(options: PeaqSdkConfig): DynamicModule {
    return {
      module: PeaqSdkModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        PeaqSdkService,
      ],
      exports: [PeaqSdkService],
    };
  }
}
