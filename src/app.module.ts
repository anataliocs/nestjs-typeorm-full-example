import { Module } from '@nestjs/common';
import { ReapController } from './reap/reap.controller';
import { ReapService } from './reap/reap.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Sdk } from '@peaq-network/sdk';
import { PeaqController } from './peaq/peaq.controller';
import { PeaqService } from './peaq/peaq.service';
import { UserModule } from './user/user.module';
import { WormholeController } from './wormhole/wormhole.controller';
import { WormholeService } from './wormhole/wormhole.service';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';
import { WormholeSdkConfig } from './wormholesdk/wormholeSdkConfig';
import { PeaqSdkConfig } from './peaqsdk/peaqSdkConfig';
import { PeaqSdkModule } from './peaqsdk/peaqSdk.module';
import { WormholeSdkModule } from './wormholesdk/wormholeSdk.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dev.local', '.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '',
      database: 'postgres',
      entities: [User],
      //synchronize: true should NOT be used in production
      synchronize: true,
      autoLoadEntities: true,
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('REAP_BASE_URL'),
        headers: {
          accept: 'application/json',
          'Accept-Version': 'v1.0',
          'x-reap-api-key': configService.get<string>('REAP_API_KEY'),
        },
      }),
      inject: [ConfigService],
    }),
    PeaqSdkModule.register({
      // Environment variable PEAQ_RPC_SERVER_URL, if set, will override this default value
      rpcServerUrl: 'https://quicknode1.peaq.xyz',
      chainType: Sdk.ChainType.EVM,
    } as PeaqSdkConfig),
    UserModule,
    WormholeSdkModule.register({
      wormholeNetwork: 'Testnet',
      platformArray: [evm, solana],
    } as WormholeSdkConfig),
  ],
  controllers: [
    ReapController,
    UserController,
    PeaqController,
    WormholeController,
  ],
  providers: [ReapService, UserService, PeaqService, WormholeService],
  exports: [PeaqSdkModule, WormholeSdkModule],
})
export class AppModule {}
