import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WormholeSdkService } from './wormhole.sdk.service';
import { WormholeConfigDataTypes } from './wormholeConfig';

// https://docs.nestjs.com/fundamentals/dynamic-modules
@Module({ imports: [ConfigModule] })
export class WormholeSdkModule {
  static register(
    options: Record<string, WormholeConfigDataTypes>,
  ): DynamicModule {
    return {
      module: WormholeSdkModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        WormholeSdkService,
      ],
      exports: [WormholeSdkService],
    };
  }
}
