import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AccountBalanceDto } from './dto/reap/account-balance.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CardDto } from './dto/reap/card.dto';
import { CardWrapperDto } from './dto/reap/card.wrapper.dto';

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
  async getMasterAccountBalance(): Promise<AccountBalanceDto> {
    const res = await firstValueFrom(
      this.httpService.get<AccountBalanceDto>(this.accountBalanceResource).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response);
          throw error;
        }),
      ),
    );

    const balance: AccountBalanceDto = res.data;
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
  async getCards(): Promise<CardDto[]> {
    const res = await firstValueFrom(
      this.httpService.get<CardWrapperDto>(this.cardsResource).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response);
          throw error;
        }),
      ),
    );

    const cardCount = res.data.meta.totalItems;
    this.logger.log(`Available Cards ${cardCount}: `);

    const cards: CardDto[] = res.data.items;
    cards.forEach((card) => {
      this.logger.log(`Card: ${card.id}`);
    });

    return cards;
  }
}
