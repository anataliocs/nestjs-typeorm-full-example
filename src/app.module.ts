import { Module } from '@nestjs/common';
import { StablecoinsController } from './stablecoins/stablecoins.controller';
import { StablecoinsService } from './stablecoins/stablecoins.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [
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
    HttpModule,
  ],
  controllers: [StablecoinsController, UserController],
  providers: [StablecoinsService, UserService],
})
export class AppModule {}
