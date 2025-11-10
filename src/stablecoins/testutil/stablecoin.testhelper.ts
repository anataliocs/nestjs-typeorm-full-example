import { AccountBalanceDto } from '../dto/reap/account-balance.dto';
import { AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';
import { CardDto } from '../dto/reap/card.dto';
import { CardWrapperDto } from '../dto/reap/card.wrapper.dto';

const mockAccountDataDto = {
  availableBalance: '100',
  availableToAllocate: '1000',
} as AccountBalanceDto;

const mockPaginationMetaDto = {
  totalItems: 1,
  itemCount: 1,
  itemsPerPage: 1,
  totalPages: 1,
  currentPage: 1,
};

const mockCardDtoArray: CardDto[] = [
  {
    id: '00000000-0000-0000-0000-000000000000',
    cardName: 'John Doe',
    secondaryCardName: 'Johnny D',
    last4: '1234',
    cardType: 'virtual',
    availableCredit: '1000.00',
    status: 'ACTIVE',
    physicalCardStatus: 'NOT_PHYSICAL_CARD',
    shippingAddress: null,
    spendControl: {
      spendControlAmount: {
        dailySpent: '0.00',
        weeklySpent: '0.00',
        monthlySpent: '0.00',
        yearlySpent: '0.00',
        allTimeSpent: '0.00',
      },
      spendControlCap: {
        transactionLimit: '500.00',
        dailyLimit: '1000.00',
        weeklyLimit: '5000.00',
        monthlyLimit: '20000.00',
        yearlyLimit: '100000.00',
        allTimeLimit: '1000000.00',
      },
      atmControl: {
        dailyFrequency: '2',
        monthlyFrequency: '20',
        dailyWithdrawal: '200.00',
        monthlyWithdrawal: '2000.00',
      },
    },
    cardDesign: '11111111-1111-1111-1111-111111111111',
    threeDSForwarding: false,
    shippingInformation: {
      bulkShippingID: null,
      sku: null,
    },
    bulkShippingID: null,
    meta: {
      id: 'user-1',
      email: 'user@example.com',
      otpPhoneNumber: {
        dialCode: 1,
        phoneNumber: '5551234567',
      },
    },
  } as CardDto,
];

type StandardHeaders = {
  'content-type': 'application/json';
};

const mockCardDtoWrapperDto = {
  items: mockCardDtoArray,
  meta: mockPaginationMetaDto,
} as CardWrapperDto;

export function successfulResponse<T>(dto: T) {
  return {
    data: dto,
    status: 200,
    statusText: 'OK',
    headers: {
      'content-type': 'application/json',
    },
    config: {},
  } as AxiosResponse<T, any, StandardHeaders>;
}

export function mockAxiosResponseByUrl(
  url: string,
): Observable<AxiosResponse<any, any, StandardHeaders>> {
  switch (url) {
    case 'account/balance':
      return of(successfulResponse<AccountBalanceDto>(mockAccountDataDto));
    case 'cards':
      return of(successfulResponse<CardWrapperDto>(mockCardDtoWrapperDto));
    default:
      return of(successfulResponse<AccountBalanceDto>(mockAccountDataDto));
  }
}
