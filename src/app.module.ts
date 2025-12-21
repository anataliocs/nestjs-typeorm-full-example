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
import { EthersSdkModule } from './etherssdk/ethersSdk.module';
import { EthersController } from './ethers/ethers.controller';
import { EthersService } from './ethers/ethers.service';
import { EthersSdkConfig } from './etherssdk/ethersSdkConfig';
import EthersSseController from './ethers/ethers.sse.controller';
import { EthersGateway } from './ethers/ethers.gateway';
import { EthersGraphqlResolver } from './ethers/ethers-graphql.resolver';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';

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
    EthersSdkModule.register({
      rpcServerUrl: 'https://mainnet.infura.io/v3/',
      network: 'Testnet',
    } as EthersSdkConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // 'autoSchemaFile' generates the schema file automatically
      autoSchemaFile: 'src/schema.gql',
      // 'playground: true' enables the GraphiQL interface for testing (useful in development)
      playground: true,
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
    }),
  ],
  controllers: [
    ReapController,
    UserController,
    PeaqController,
    WormholeController,
    EthersController,
    EthersSseController,
  ],
  providers: [
    ReapService,
    UserService,
    PeaqService,
    WormholeService,
    EthersService,
    EthersGateway,
    EthersGraphqlResolver,
  ],
  exports: [PeaqSdkModule, WormholeSdkModule],
})
export class AppModule {}
