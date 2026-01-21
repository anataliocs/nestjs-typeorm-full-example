import { Controller } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';

@Controller('bitcoin')
export class BitcoinController {
  constructor(private readonly bitcoinService: BitcoinService) {}
}
