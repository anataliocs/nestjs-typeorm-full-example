import { Test, TestingModule } from '@nestjs/testing';
import { EthersGateway } from './ethers.gateway';

describe('EthersGateway', () => {
  let gateway: EthersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EthersGateway],
    }).compile();

    gateway = module.get<EthersGateway>(EthersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
