import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AccountBalanceDto } from './dto/reap/account-balance.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CardDto } from './dto/reap/card.dto';
import { CardWrapperDto } from './dto/reap/card.wrapper.dto';
import { CreateCardResponseDto } from './dto/reap/create-card-response.dto';

@Injectable()
export class StablecoinsService {
  private readonly logger = new Logger(StablecoinsService.name);

  constructor(private readonly httpService: HttpService) {}

  private accountBalanceResource: string = 'account/balance';
  private cardsResource: string = 'cards';

  /**
   * Handles `AccountBalanceDto` returned from the `httpService.get()`
   * [Get primary account balance](https://reap.readme.io/reference/get_account-balance) call.
   *
   * @returns  `AccountBalanceDto`
   * @throws AxiosError in case of HTTP error
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
   * Handles `CardDto` array returned from the `httpService.get()`
   * [Retrieve all cards](https://reap.readme.io/reference/get_cards) call.
   *
   * @returns  `CardDto[]`
   * @throws AxiosError in case of HTTP error
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

  /**
   * Create a new card
   * Handles `CreateCardResponseDto` returned from the `httpService.post()`
   * [Create new card](https://reap.readme.io/reference/post_cards) call.
   *
   * @returns  `CreateCardResponseDto`
   * @throws AxiosError in case of HTTP error
   */
  async createCard(card: CardDto): Promise<CreateCardResponseDto> {
    const res = await firstValueFrom(
      this.httpService
        .post<CreateCardResponseDto>(this.cardsResource, card)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response);
            throw error;
          }),
        ),
    );

    const createdCard: CreateCardResponseDto = res.data;
    this.logger.log(`Created Card: ${createdCard.id}:`);

    return createdCard;
  }
}
