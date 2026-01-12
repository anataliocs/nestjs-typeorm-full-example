import { Module } from '@nestjs/common';
import { SolkitService } from './solkit.service';
import { SolkitController } from './solkit.controller';

@Module({
  controllers: [SolkitController],
  providers: [SolkitService],
})
export class SolkitModule {}
