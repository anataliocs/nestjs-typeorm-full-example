import { Controller, Get, Header, HttpCode, Version } from '@nestjs/common';
import { SolkitService } from './solkit.service';
import { Observable } from 'rxjs';
import { SolanaBlockNumber } from './dto/solana-block-number';
import { SolanaFinalizedBlock } from './dto/solana-finalized-block';

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

  @Version('1')
  @Get('/finalized-block')
  @Header('Cache-Control', 'no-store')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @HttpCode(200)
  getFinalizedBlock(): Observable<SolanaFinalizedBlock> {
    // Call Service layer to get status
    return this.solkitService.finalizedBlockForApi();
  }
}
