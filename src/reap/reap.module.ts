import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ReapController } from './reap.controller';
import { ReapService } from './reap.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HttpModule],
  controllers: [ReapController],
  providers: [ReapService],
  exports: [TypeOrmModule],
})
export class ReapModule {}
