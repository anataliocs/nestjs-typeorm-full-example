import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WormholeSdkService } from './wormhole.sdk.service';
import { WormholeSdkConfig } from './wormholeSdkConfig';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';

// https://docs.nestjs.com/fundamentals/dynamic-modules
@Module({ imports: [ConfigModule] })
export class WormholeSdkModule {
  static register(options: WormholeSdkConfig): DynamicModule {
    return {
      module: WormholeSdkModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        WormholeSdkService,
      ],
      exports: [WormholeSdkService],
    };
  }
}
