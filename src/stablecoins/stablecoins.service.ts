import { Injectable, Logger } from '@nestjs/common';
import { CustomerDto } from './dto/customer.dto';
import { HttpService } from '@nestjs/axios';
import { ReapAccountBalanceDto } from './dto/reap-account-balance.dto';

@Injectable()
export class StablecoinsService {
  private readonly logger = new Logger(StablecoinsService.name);

  constructor(private readonly httpService: HttpService) {}

  private accountBalanceResource: string = 'account/balance';

  getCustomersById(id: string): CustomerDto {
    console.log(id);

    this.httpService
      .get<ReapAccountBalanceDto>(this.accountBalanceResource)
      .subscribe((res) => {
        console.log(res.data);
        const balance: ReapAccountBalanceDto = res.data;
        this.logger.log(`Available Balance ${balance.availableBalance}: `);
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
