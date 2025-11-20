import { AccountBalanceDto } from '../dto/reap/account-balance.dto';
import { AxiosError, AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';
import { CardDto } from '../dto/reap/card.dto';
import { CardWrapperDto } from '../dto/reap/card.wrapper.dto';
import { CreateCardResponseDto } from '../dto/reap/create-card-response.dto';

const mockCreateCardResponseDto: CreateCardResponseDto = {
  id: '507e7dd7-5c8f-480f-9cf3-2500ae807e16',
};

// Mock account-balance.dto.ts for account/balance endpoint
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

// Mock card.dto.ts for card endpoint
export const mockCardDto = {
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
} as CardDto;

const mockCardDtoArray: CardDto[] = [mockCardDto];

const mockCardDtoWrapperDto = {
  items: mockCardDtoArray,
  meta: mockPaginationMetaDto,
} as CardWrapperDto;

export function clientErrorResponse(errorMsg: string): AxiosError {
  return {
    message: errorMsg,
    name: 'AxiosError',
    stack:
      'AxiosError: Request failed with status code 404\n    at settle (/Users/chrisanatalio/WebstormProjects/nestjs-typeorm-full-example/node_modules/.pnpm/axios@1.12.2/node_modules/axios/lib/core/settle.js:19:12)\n    at Unzip.handleStreamEnd (/Users/chrisanatalio/WebstormProjects/nestjs-typeorm-full-example/node_modules/.pnpm/axios@1.12.2/node_modules/axios/lib/adapters/http.js:617:11)\n    at Unzip.emit (node:events:530:35)\n    at endReadableNT (node:internal/streams/readable:1698:12)\n    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)\n    at Axios.request (/Users/chrisanatalio/WebstormProjects/nestjs-typeorm-full-example/node_modules/.pnpm/axios@1.12.2/node_modules/axios/lib/core/Axios.js:45:41)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)',
    config: {},
    code: 'ERR_BAD_REQUEST',
    status: 404,
  } as AxiosError;
}

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

type StandardHeaders = {
  'content-type': 'application/json';
};

type ExpectedDtoTypes =
  | AccountBalanceDto
  | CardWrapperDto
  | CreateCardResponseDto;

export function mockAxiosGetResponseByUrl(
  url: string,
): Observable<AxiosResponse<ExpectedDtoTypes, any, StandardHeaders>> {
  switch (url) {
    case 'account/balance':
      return of(successfulResponse<AccountBalanceDto>(mockAccountDataDto));
    case 'cards':
      return of(successfulResponse<CardWrapperDto>(mockCardDtoWrapperDto));
    default:
      return of(successfulResponse<AccountBalanceDto>(mockAccountDataDto));
  }
}

export function mockAxiosPostResponseByUrl(
  url: string,
  body: object,
): Observable<AxiosResponse<ExpectedDtoTypes, any, StandardHeaders>> {
  switch (url) {
    case 'cards':
      if (body !== null)
        return of(
          successfulResponse<CreateCardResponseDto>(mockCreateCardResponseDto),
        );
      else throw new Error('Invalid body type');
    default:
      return of(successfulResponse<AccountBalanceDto>(mockAccountDataDto));
  }
}

/*
 * Helper functions for assertions
 */
export const failedWithStatusCode404Msg = 'Request failed with status code 404';
export const assertError404 = (e: AxiosError, expectedErrMsg: string) => {
  expect(e).toBeDefined();
  expect(e).toHaveProperty('status', 404);
  expect(e).toHaveProperty('message', expectedErrMsg);
};
