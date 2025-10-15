import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsService } from './stablecoins.service';
import { CustomerDto } from './dto/customer.dto';

describe('StablecoinsService', () => {
  let service: StablecoinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StablecoinsService],
    }).compile();

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
