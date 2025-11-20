/*
Sample payload used to shape this DTO:
{
  "id": "507e7dd7-5c8f-480f-9cf3-2500ae807e16",
  "cardName": "Chris Anatalio",
  "secondaryCardName": "",
  "last4": "1213",
  "cardType": "virtual",
  "availableCredit": "0.00",
  "status": "ACTIVE",
  "physicalCardStatus": "NOT_PHYSICAL_CARD",
  "shippingAddress": null,
  "spendControl": {
    "spendControlAmount": {
      "dailySpent": "0.00",
      "weeklySpent": "0.00",
      "monthlySpent": "0.00",
      "yearlySpent": "0.00",
      "allTimeSpent": "0.00"
    },
    "spendControlCap": {
      "transactionLimit": "0.00",
      "dailyLimit": "0.00",
      "weeklyLimit": "0.00",
      "monthlyLimit": "0.00",
      "yearlyLimit": "0.00",
      "allTimeLimit": "0.00"
    },
    "atmControl": {
      "dailyFrequency": "0.00",
      "monthlyFrequency": "0.00",
      "dailyWithdrawal": "0.00",
      "monthlyWithdrawal": "0.00"
    }
  },
  "cardDesign": "1446b2b0-9ad3-4589-84e6-e74ab14e2cce",
  "threeDSForwarding": false,
  "shippingInformation": {
    "bulkShippingID": null,
    "sku": null
  },
  "bulkShippingID": null,
  "meta": {
    "id": "string",
    "email": "user@example.com",
    "otpPhoneNumber": {
      "dialCode": 1,
      "phoneNumber": "5033472552"
    }
  }
}
*/

export class SpendControlAmountDto {
  dailySpent: string;
  weeklySpent: string;
  monthlySpent: string;
  yearlySpent: string;
  allTimeSpent: string;
}

export class SpendControlCapDto {
  transactionLimit: string;
  dailyLimit: string;
  weeklyLimit: string;
  monthlyLimit: string;
  yearlyLimit: string;
  allTimeLimit: string;
}

export class AtmControlDto {
  dailyFrequency: string;
  monthlyFrequency: string;
  dailyWithdrawal: string;
  monthlyWithdrawal: string;
}

export class SpendControlDto {
  spendControlAmount: SpendControlAmountDto;
  spendControlCap: SpendControlCapDto;
  atmControl: AtmControlDto;
}

export class ShippingInformationDto {
  bulkShippingID: string | null;
  sku: string | null;
}

export class OtpPhoneNumberDto {
  dialCode: number;
  phoneNumber: string;
}

export class MetaDto {
  id: string;
  email: string;
  otpPhoneNumber: OtpPhoneNumberDto;
}

export class CardDto {
  id: string;
  cardName: string;
  secondaryCardName: string;
  last4: string;
  cardType: string;
  availableCredit: string;
  status: string;
  physicalCardStatus: string;
  shippingAddress: string | null;
  spendControl: SpendControlDto;
  cardDesign: string;
  threeDSForwarding: boolean;
  shippingInformation: ShippingInformationDto;
  bulkShippingID: string | null;
  meta: MetaDto;
}
