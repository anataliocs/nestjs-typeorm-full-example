import { Test, TestingModule } from '@nestjs/testing';
import { StablecoinsController } from './stablecoins.controller';
import { CustomerDto } from './dto/customer.dto';
import { StablecoinsService } from './stablecoins.service';
import { HttpService } from '@nestjs/axios';

describe('StablecoinsController', () => {
  let controller: StablecoinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StablecoinsController],
      providers: [StablecoinsService],
    })
      .useMocker((token) => {
        if (token === HttpService) {
          return jest.fn();
        }
      })
      .compile();

    controller = module.get<StablecoinsController>(StablecoinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getCustomersById response should be defined', () => {
    const customersById: CustomerDto = controller.getCustomersById('test');
    console.log(customersById);
    expect(customersById).toBeDefined();
    expect(customersById).toHaveProperty('name', 'John');
    expect(customersById).toHaveProperty('id', '123');
  });
});
