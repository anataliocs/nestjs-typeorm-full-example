import { Controller } from '@nestjs/common';
import { EthersService } from './ethers.service';

@Controller('ethers')
export class EthersController {
  constructor(private readonly ethersService: EthersService) {}
}
