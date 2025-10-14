import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { StablecoinsService } from './stablecoins.service';
import { CustomerDto } from './dto/customer.dto';

@Controller('/v1/stablecoins')
export class StablecoinsController {
  constructor(private readonly stablecoinsService: StablecoinsService) {}

  @Get('/:id/customers')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getCustomersById(@Param('id') id: string): string {
    // Call Service layer to get customers
    return this.stablecoinsService.getCustomersById(id);
  }

  @Get('/:name/customers')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getCustomersByName(@Param('name') name: string): string {
    // Call Service layer to get customers
    return this.stablecoinsService.getCustomersByName(name);
  }

  @Post('/customers')
  @Header('Cache-Control', 'no-store')
  @HttpCode(201)
  createCustomer(@Body() customer: CustomerDto): string {
    console.log(customer);
    return 'Customer created';
  }
}
