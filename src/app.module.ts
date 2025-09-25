import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StablecoinsController } from './stablecoins/stablecoins.controller';
import { StablecoinsService } from './stablecoins/stablecoins.service';

@Module({
  imports: [],
  controllers: [AppController, StablecoinsController],
  providers: [AppService, StablecoinsService],
})
export class AppModule {}
