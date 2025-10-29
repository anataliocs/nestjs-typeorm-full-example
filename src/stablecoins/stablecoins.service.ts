import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ReapAccountBalanceDto } from './dto/reap-account-balance.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class StablecoinsService {
  private readonly logger = new Logger(StablecoinsService.name);

  constructor(private readonly httpService: HttpService) {}

  private accountBalanceResource: string = 'account/balance';
  private cardsResource: string = 'cards';

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

  /**
   * Get all cards
   * Handles `` returned from the `httpService.get()`
   * [Retrieve all cards](https://reap.readme.io/reference/get_cards) call.
   *
   * @returns  ``
   * @throws Error in case of invalid data
   */
  async getCards(): Promise<string> {
    const res = await firstValueFrom(
      this.httpService.get<string>(this.cardsResource).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response);
          throw error;
        }),
      ),
    );

    const balance = res.data;
    this.logger.log(`Available Cards ${balance}: `);

    return balance;
  }
}
