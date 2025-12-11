import { Controller, Get, Header, HttpCode, Version } from '@nestjs/common';
import { PeaqService } from './peaq.service';

@Controller('/peaq')
export class PeaqController {
  constructor(private readonly peaqService: PeaqService) {}

  @Version('1')
  @Get('/server-status')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getServerStatus(): string {
    // Call Service layer to get status
    return this.peaqService.serverStatus();
  }
}
