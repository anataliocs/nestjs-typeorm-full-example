import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Post,
  Version,
} from '@nestjs/common';
import { StablecoinsService } from './stablecoins.service';
import { CustomerDto } from './dto/customer.dto';

@Controller('/v1/stablecoins')
export class StablecoinsController {
  constructor(private readonly stablecoinsService: StablecoinsService) {}

  @Version('1')
  @Get('/:id/customers')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getCustomersById(@Param('id') id: string): CustomerDto {
    // Call Service layer to get customers
    return this.stablecoinsService.getCustomersById(id);
  }

  @Version('1')
  @Get('/:name/customers')
  @Header('Cache-Control', 'no-store')
  @HttpCode(200)
  getCustomersByName(@Param('name') name: string): CustomerDto {
    // Call Service layer to get customers
    return this.stablecoinsService.getCustomersByName(name);
  }

  @Version('1')
  @Post('/customers')
  @Header('Cache-Control', 'no-store')
  @HttpCode(201)
  createCustomer(@Body() customer: CustomerDto): CustomerDto {
    console.log(customer);
    return customer;
  }
}
