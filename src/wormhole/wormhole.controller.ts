import {
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Version,
} from '@nestjs/common';
import { WormholeService } from './wormhole.service';
import { ChainConfigDto } from './dto/chain-config.dto';
import { ApiResponse } from '@nestjs/swagger';

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

  @Version('1')
  @Get('/network')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  network(): string {
    // Call Service layer to get balance
    return this.wormholeService.network();
  }

  @ApiResponse({
    status: 200,
    description: 'Chain Configuration info',
    type: ChainConfigDto,
  })
  @Version('1')
  @Get('/chain-context/:platform')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  chainContext(@Param('platform') platform: string): ChainConfigDto {
    //TODO capitalize first letter filter
    return this.wormholeService.getChainContext(platform);
  }
}
