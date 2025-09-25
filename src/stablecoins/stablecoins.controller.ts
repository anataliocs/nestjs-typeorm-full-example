import { Controller, Get, Param } from '@nestjs/common';
import { StablecoinsService } from './stablecoins.service';

@Controller('/v1/stablecoins')
export class StablecoinsController {
  constructor(private readonly stablecoinsService: StablecoinsService) {}

  @Get('/:id/customers')
  getCustomers(@Param('id') id: string): string {
    // Call Service layer to get customers
    return this.stablecoinsService.getCustomers(id);
  }
}
