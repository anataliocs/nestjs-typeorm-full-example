import { Injectable } from '@nestjs/common';

@Injectable()
export class StablecoinsService {
  getCustomers(id: string): string {
    console.log(id);

    return 'Customers';
  }
}
