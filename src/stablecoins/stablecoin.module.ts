import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { StablecoinsController } from './stablecoins.controller';
import { StablecoinsService } from './stablecoins.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HttpModule],
  controllers: [StablecoinsController],
  providers: [StablecoinsService],
  exports: [TypeOrmModule],
})
export class StablecoinModule {}
