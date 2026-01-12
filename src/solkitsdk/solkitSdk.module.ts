import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';
import { SolkitSdkConfig } from './solkitSdkConfig';
import { SolkitSdkService } from './solkit.sdk.service';

interface SolkitSdkModuleAsyncOptions {
  imports: ConfigModule[];
  useFactory: (...args: any[]) => Promise<SolkitSdkConfig> | SolkitSdkConfig;
  inject: FactoryProvider['inject'];
}

// https://docs.nestjs.com/fundamentals/dynamic-modules
@Module({ imports: [ConfigModule] })
export class SolkitSdkModule {
  static registerAsync(options: SolkitSdkModuleAsyncOptions): DynamicModule {
    return {
      module: SolkitSdkModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: [ConfigService],
        },
        SolkitSdkService,
      ],
      exports: [SolkitSdkService],
    };
  }
}
