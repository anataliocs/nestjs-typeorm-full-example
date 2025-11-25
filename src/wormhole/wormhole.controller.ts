import { Controller, Get, Header, HttpCode, Version } from '@nestjs/common';
import { WormholeService } from './wormhole.service';

@Controller('/wormhole')
export class WormholeController {
  constructor(private readonly wormholeService: WormholeService) {}

  @Version('1')
  @Get('/server-status')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getServerStatus(): string {
    // Call Service layer to get balance
    return this.wormholeService.serverStatus();
  }
}
