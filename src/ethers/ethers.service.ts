import { Injectable, Logger } from '@nestjs/common';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';

@Injectable()
export class EthersService {
  private readonly logger = new Logger(EthersService.name);

  constructor(private readonly ethersSdkService: EthersSdkService) {}

  serverStatus(): string {
    const rpcServerStatus = this.ethersSdkService.rpcServerStatus;
    this.logger.log(`Ethers SDK Server Status: ${rpcServerStatus}`);

    return rpcServerStatus;
  }

  blockNumber(): Promise<number> {
    return this.ethersSdkService.getBlockNumber();
  }
}
