import { Injectable, Logger } from '@nestjs/common';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';

@Injectable()
export class EthersService {
  private readonly logger = new Logger(EthersService.name);

  constructor(private readonly ethersSdkService: EthersSdkService) {}

  serverStatus(): string {
    this.logger.log(
      `Ethers SDK Server Status: ${this.ethersSdkService.rpcServerStatus}`,
    );

    return this.ethersSdkService.rpcServerStatus;
  }
}
