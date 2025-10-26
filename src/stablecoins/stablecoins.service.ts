import { Injectable } from '@nestjs/common';
import { CustomerDto } from './dto/customer.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class StablecoinsService {
  constructor(private readonly httpService: HttpService) {}

  getCustomersById(id: string): CustomerDto {
    console.log(id);

    return {
      name: 'John',
      id: '123',
    } as CustomerDto;
  }
  getCustomersByName(name: string): CustomerDto {
    console.log(name);

    return {
      name: 'John',
      id: '123',
    } as CustomerDto;
  }
}
