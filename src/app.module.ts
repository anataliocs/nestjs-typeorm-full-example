import { Module } from '@nestjs/common';
import { StablecoinsController } from './stablecoins/stablecoins.controller';
import { StablecoinsService } from './stablecoins/stablecoins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { StablecoinModule } from './stablecoins/stablecoin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.development.local', '.env'],
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
    UserModule,
    StablecoinModule,
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
  ],
  controllers: [StablecoinsController, UserController],
  providers: [StablecoinsService, UserService],
})
export class AppModule {}
