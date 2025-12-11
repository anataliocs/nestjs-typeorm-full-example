import { Controller, Get, Header, HttpCode, Version } from '@nestjs/common';
import { EthersService } from './ethers.service';

@Controller('/ethers')
export class EthersController {
  constructor(private readonly ethersService: EthersService) {}

  @Version('1')
  @Get('/server-status')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getServerStatus(): string {
    // Call Service layer to get status
    return this.ethersService.serverStatus();
  }

  @Version('1')
  @Get('/block-number')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getBlockNumber(): Promise<number> {
    // Call Service layer to get status
    return this.ethersService.blockNumber();
  }
}
