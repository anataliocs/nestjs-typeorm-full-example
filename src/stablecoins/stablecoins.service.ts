import { Injectable } from '@nestjs/common';
import { CustomerDto } from './dto/customer.dto';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class StablecoinsService {
  constructor(private readonly httpService: HttpService) {}

  private accountBalanceResource: string = 'account/balance';

  getCustomersById(id: string): CustomerDto {
    console.log(id);

    this.httpService.get(this.accountBalanceResource).subscribe((res) => {
      console.log(res.data);
    });

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
