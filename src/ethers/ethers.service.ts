import { Injectable, Logger } from '@nestjs/common';
import { EthersSdkService } from '../etherssdk/ethers.sdk.service';
import { from, Observable } from 'rxjs';

export interface BlockNumber {
  blockNumber: number;
}

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

  /**
   * Convert `Promise<MessageEvent>` to `Observable<MessageEvent>`
   *
   * @returns  `Observable<MessageEvent>`
   */
  subscribeToNewBlocks(): (n: number) => Observable<MessageEvent<BlockNumber>> {
    return (n: number): Observable<MessageEvent<BlockNumber>> =>
      from(this.buildMessageEvent(n));
  }

  private async buildMessageEvent(
    n: number,
  ): Promise<MessageEvent<BlockNumber>> {
    return {
      type: 'message',
      id: n,
      data: {
        blockNumber: await this.ethersSdkService.getBlockNumber(),
      } as BlockNumber,
      retry: 0,
    } as unknown as MessageEvent;
  }
}
