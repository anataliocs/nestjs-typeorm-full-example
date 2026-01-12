import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SolkitSdkService } from './solkit.sdk.service';
import { CONFIG_OPTIONS } from '../sdk/sdk.common';
import { SolkitSdkConfig } from './solkitSdkConfig';

// https://docs.nestjs.com/fundamentals/dynamic-modules
@Module({ imports: [ConfigModule] })
export class SolkitSdkModule {
  static register(options: SolkitSdkConfig): DynamicModule {
    return {
      module: SolkitSdkModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        SolkitSdkService,
      ],
      exports: [SolkitSdkService],
    };
  }
}
