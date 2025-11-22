import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PeaqSdkService } from './peaq.sdk.service';

// https://docs.nestjs.com/fundamentals/dynamic-modules
@Module({ imports: [ConfigModule] })
export class PeaqSdkModule {
  static register(options: Record<string, string>): DynamicModule {
    return {
      module: PeaqSdkModule,
      providers: [
        {
          provide: 'CONFIG_OPTIONS',
          useValue: options,
        },
        PeaqSdkService,
      ],
      exports: [PeaqSdkService],
    };
  }
}
