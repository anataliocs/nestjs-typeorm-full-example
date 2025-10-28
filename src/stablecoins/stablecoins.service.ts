import { Injectable, Logger } from '@nestjs/common';
import { CustomerDto } from './dto/customer.dto';
import { HttpService } from '@nestjs/axios';
import { ReapAccountBalanceDto } from './dto/reap-account-balance.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class StablecoinsService {
  private readonly logger = new Logger(StablecoinsService.name);

  constructor(private readonly httpService: HttpService) {}

  private accountBalanceResource: string = 'account/balance';

  /**
   * Handles `ReapAccountBalanceDto` returned from the `httpService.get()`
   * [Get master account balance](https://reap.readme.io/reference/get_account-balance) call.
   *
   * @returns  `ReapAccountBalanceDto`
   * @throws Error in case of invalid data
   */
  async getMasterAccountBalance(): Promise<ReapAccountBalanceDto> {
    const res = await firstValueFrom(
      this.httpService
        .get<ReapAccountBalanceDto>(this.accountBalanceResource)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response);
            throw error;
          }),
        ),
    );

    const balance: ReapAccountBalanceDto = res.data;
    this.logger.log(`Available Balance ${balance.availableBalance}: `);

    return balance;
  }
  getCustomersByName(name: string): CustomerDto {
    console.log(name);

    return {
      name: 'John',
      id: '123',
    } as CustomerDto;
  }
}
