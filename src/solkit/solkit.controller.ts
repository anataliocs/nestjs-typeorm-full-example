import { Controller, Get, Header, HttpCode, Version } from '@nestjs/common';
import { SolkitService } from './solkit.service';
import { Observable } from 'rxjs';
import { SolanaBlockNumber } from './dto/solana-block-number';

@Controller('solkit')
export class SolkitController {
  constructor(private readonly solkitService: SolkitService) {}

  @Version('1')
  @Get('/server-status')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getServerStatus(): string {
    return this.solkitService.serverStatusForApi();
  }

  @Version('1')
  @Get('/block-number')
  @Header('Cache-Control', 'no-store')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @HttpCode(200)
  getBlockNumber(): Observable<SolanaBlockNumber> {
    return this.solkitService.blockNumberForApi();
  }
}
