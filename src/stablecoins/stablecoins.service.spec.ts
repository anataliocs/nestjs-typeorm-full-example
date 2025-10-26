import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsService } from './stablecoins.service';
import { CustomerDto } from './dto/customer.dto';
import { HttpService } from '@nestjs/axios';

describe('StablecoinsService', () => {
  let service: StablecoinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StablecoinsService],
    })
      .useMocker((token) => {
        if (token === HttpService) {
          return jest.fn();
        }
      })
      .compile();

    service = module.get<StablecoinsService>(StablecoinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getCustomersById response should be defined', () => {
    const customersById: CustomerDto = service.getCustomersById('test');
    console.log(customersById);
    expect(customersById).toBeDefined();
    expect(customersById).toHaveProperty('name', 'John');
    expect(customersById).toHaveProperty('id', '123');
  });
});
