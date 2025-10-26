import { Module } from '@nestjs/common';
import { StablecoinsController } from './stablecoins/stablecoins.controller';
import { StablecoinsService } from './stablecoins/stablecoins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { StablecoinModule } from './stablecoins/stablecoin.module';
import { ConfigModule } from '@nestjs/config';

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
    HttpModule,
  ],
  controllers: [StablecoinsController, UserController],
  providers: [StablecoinsService, UserService],
})
export class AppModule {}
