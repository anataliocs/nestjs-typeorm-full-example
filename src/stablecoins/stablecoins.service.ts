import { Injectable } from '@nestjs/common';

@Injectable()
export class StablecoinsService {
  getCustomersById(id: string): string {
    console.log(id);

    return 'Customers';
  }
  getCustomersByName(name: string): string {
    console.log(name);

    return 'Customers by Name';
  }
}
