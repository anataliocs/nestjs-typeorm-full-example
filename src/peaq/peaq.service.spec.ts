import { Test, TestingModule } from '@nestjs/testing';
import { PeaqService } from './peaq.service';
import { PeaqSdkService } from '../peaqsdk/peaq.sdk.service';
import { ConfigService } from '@nestjs/config';

describe('PeaqService', () => {
  let service: PeaqService;
  let peaqSdkService: PeaqSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeaqService, ConfigService, PeaqSdkService],
    })
      .useMocker((token) => {
        if (token === 'CONFIG_OPTIONS') {
          return jest.fn();
        }
      })
      .compile();

    service = module.get<PeaqService>(PeaqService);
    peaqSdkService = module.get<PeaqSdkService>(PeaqSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(peaqSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });
});
