import { Test, TestingModule } from '@nestjs/testing';
import { WormholeController } from './wormhole.controller';
import { WormholeService } from './wormhole.service';
import { WormholeSdkService } from '../wormholesdk/wormhole.sdk.service';
import { ConfigService } from '@nestjs/config';

describe('WormholeController', () => {
  let controller: WormholeController;
  let service: WormholeService;
  let wormholeSdkService: WormholeSdkService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WormholeController],
      providers: [WormholeService, WormholeSdkService, ConfigService],
    })
      .useMocker((token) => {
        if (token === 'CONFIG_OPTIONS') {
          return jest.fn();
        }
      })
      .compile();

    controller = module.get<WormholeController>(WormholeController);
    service = module.get<WormholeService>(WormholeService);
    wormholeSdkService = module.get<WormholeSdkService>(WormholeSdkService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(wormholeSdkService).toBeDefined();
    expect(configService).toBeDefined();
  });
});
