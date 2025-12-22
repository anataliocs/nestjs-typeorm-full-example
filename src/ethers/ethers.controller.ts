import { Controller, Get, Header, HttpCode, Version } from '@nestjs/common';
import { EthersService } from './ethers.service';
import { BlockOrNull } from '../etherssdk/ethers.sdk.service';
import { Observable } from 'rxjs';

@Controller('/ethers')
export class EthersController {
  constructor(private readonly ethersService: EthersService) {}

  @Version('1')
  @Get('/server-status')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getServerStatus(): string {
    // Call Service layer to get status
    return this.ethersService.serverStatusForApi();
  }

  @Version('1')
  @Get('/block-number')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getBlockNumber(): Observable<number> {
    // Call Service layer to get status
    return this.ethersService.blockNumberForApi();
  }

  @Version('1')
  @Get('/finalized-block')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getFinalizedBlock(): Observable<BlockOrNull> {
    // Call Service layer to get status
    return this.ethersService.finalizedBlockForApi();
  }
}
