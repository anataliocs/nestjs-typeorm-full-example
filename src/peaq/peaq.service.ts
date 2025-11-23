import { Injectable, Logger } from '@nestjs/common';
import { PeaqSdkService } from '../peaqsdk/peaq.sdk.service';

@Injectable()
export class PeaqService {
  private readonly logger = new Logger(PeaqService.name);

  constructor(private readonly peaqSdkService: PeaqSdkService) {}

  serverStatus(): string {
    this.logger.log(
      `Peaq SDK Server Status: ${this.peaqSdkService.rpcServerStatus}`,
    );

    return this.peaqSdkService.rpcServerStatus;
  }
}
