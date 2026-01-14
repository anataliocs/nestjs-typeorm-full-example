import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EthersSdkService } from './ethers.sdk.service';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';
import { EthersSdkConfig } from './ethersSdkConfig';

interface EthersSdkModuleAsyncOptions {
  imports: ConfigModule[];
  useFactory: (...args: any[]) => Promise<EthersSdkConfig> | EthersSdkConfig;
  inject: FactoryProvider['inject'];
}

// https://docs.nestjs.com/fundamentals/dynamic-modules
@Module({ imports: [ConfigModule] })
export class EthersSdkModule {
  static registerAsync(options: EthersSdkModuleAsyncOptions): DynamicModule {
    return {
      module: EthersSdkModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: [ConfigService],
        },
        EthersSdkService,
      ],
      exports: [EthersSdkService],
    };
  }
}
